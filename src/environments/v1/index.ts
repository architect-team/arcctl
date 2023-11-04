import * as path from 'std/path/mod.ts';
import { adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator';
import type { ComponentStore } from '../../component-store/index.ts';
import { Component, parseComponent } from '../../components/index.ts';
import { AppGraph, AppGraphNode } from '../../graphs/index.ts';
import { ComponentMetadata, Environment } from '../environment.ts';
import { VariableMergingDisabledError } from '../errors.ts';

export default class EnvironmentV1 extends Environment {
  /**
   * Local variables that can be used to parameterize the environment
   */
  locals?: Record<string, string>;

  /**
   * Configuration settings for the components that may be deployed inside this environment
   */
  components?: {
    [key: string]: {
      /**
       * The source of the component to deploy. Can either be a docker registry repository or a reference to the local filesystem prefixed with `file:`
       */
      source?: string;

      /**
       * Values for variables the component expects
       */
      variables?: {
        [key: string]: string | string[];
      };

      /**
       * Configuration for each service in the component
       */
      deployments?: {
        [key: string]: {
          /**
           * Set to false to make sure the deployment doesn't run in this environment
           */
          enabled?: boolean;

          /**
           * Values for environment variables in the deployment
           */
          environment?: {
            [key: string]: string | number | boolean | null | undefined;
          };

          /**
           * Number of replicas of the deployment to maintain
           */
          replicas?: number;

          /**
           * Autoscaling rules for the deployment within the environment
           */
          autoscaling?: {
            /**
             * Minimum number of replicas to maintain
             * @default 1
             */
            min_replicas?: number;

            /**
             * Maximum number of replicas to maintain
             * @default 1
             */
            max_replicas?: number;
          };
        };
      };

      services?: {
        [key: string]: {
          /**
           * Existing hostname that should act as the interface host instead of creating a new one
           */
          host?: string;

          /**
           * Existing port that should act as the interface port instead of registering a new one
           */
          port?: number;
        };
      };

      ingresses?: {
        [key: string]: {
          /**
           * A subdomain that the ingress listens on
           */
          subdomain?: string;

          /**
           * A path that the ingress listens on
           */
          path?: string;

          /**
           * Set to true to make the ingress only available from a private gateway (no public IP)
           */
          internal?: boolean;

          /**
           * Custom TLS configuration for the ingress rule
           */
          tls?: {
            crt: string;
            key: string;
            ca?: string;
          };
        };
      };
    };
  };

  public constructor(data: Record<string, any>) {
    super();
    Object.assign(this, data);
  }

  private enrichDeployment(node: AppGraphNode<'deployment'>): AppGraphNode<'deployment'> {
    if (!node.component || !this.components) {
      return node;
    }

    const component_config = this.components[node.component];
    const deployment_config = component_config?.deployments?.[node.name];

    if (deployment_config?.autoscaling) {
      node.inputs.replicas = deployment_config.replicas || 1;
      node.inputs.autoscaling = {
        min_replicas: deployment_config.autoscaling?.min_replicas || 1,
        max_replicas: deployment_config.autoscaling?.max_replicas || 1,
      };
    }

    if (deployment_config?.environment) {
      node.inputs.environment = {
        ...node.inputs.environment,
        ...deployment_config.environment,
      };
    }

    return node;
  }

  private enrichService(node: AppGraphNode<'service'>): AppGraphNode<'service'> {
    if (!node.component || !this.components) {
      return node;
    }

    const component_config = this.components[node.component];
    const service_config = component_config?.services?.[node.name];
    if (service_config?.host) {
      node.inputs = {
        ...node.inputs,
        external_hostname: service_config.host,
        port: service_config.port || ('port' in node.inputs ? node.inputs.port : undefined),
      };
    }

    return node;
  }

  private enrichIngressRule(node: AppGraphNode<'ingress'>): AppGraphNode<'ingress'> {
    const component_config = this.components?.[node.component || ''];
    const ingress_config = component_config?.ingresses?.[node.name];

    const randomName = uniqueNamesGenerator({
      dictionaries: [adjectives, animals],
      length: 2,
      separator: '-',
      style: 'lowerCase',
      seed: node.getId(),
    });

    node.inputs.path = ingress_config?.path || node.inputs.path;
    node.inputs.subdomain = ingress_config?.subdomain || node.inputs.subdomain || randomName;
    node.inputs.internal = ingress_config?.internal || node.inputs.internal;

    return node;
  }

  private enrichSecret(node: AppGraphNode<'secret'>, additionalValues?: string[]): AppGraphNode<'secret'> {
    if (!node.inputs.merge && additionalValues && additionalValues.length > 0) {
      throw new VariableMergingDisabledError(node.name, additionalValues, node.component);
    }

    const env_value = node.component ? this.components?.[node.component]?.variables?.[node.name] : undefined;
    if (node.inputs.merge && env_value) {
      const default_value = JSON.parse(node.inputs.data || '[]');
      if (typeof env_value === 'string') {
        default_value.push(env_value);
      } else {
        default_value.push(...env_value);
      }

      if (additionalValues) {
        default_value.push(...additionalValues);
      }

      node.inputs.data = JSON.stringify(default_value.sort());
    } else if (env_value) {
      if (Array.isArray(env_value)) {
        throw new Error(`Cannot use array inputs for non-merge variables: ${env_value}`);
      }

      node.inputs.data = env_value;
    } else if (node.inputs.merge) {
      const default_value = JSON.parse(node.inputs.data || '[]');
      if (additionalValues) {
        default_value.push(...additionalValues);
      }
      node.inputs.data = JSON.stringify(default_value.sort());
    }

    return node;
  }

  private enrichLocal() {
    Object.assign(
      this,
      JSON.parse(
        JSON.stringify(this).replace(
          /\${{\s?locals\.([\w-]+)\s?}}/g,
          (_, local_name) => {
            return this.locals?.[local_name] || '';
          },
        ),
      ),
    );
  }

  public async getGraph(environment_name: string, componentStore: ComponentStore, debug = false): Promise<AppGraph> {
    const graph = new AppGraph();

    // Replace all local values
    this.enrichLocal();

    // Populate explicit components
    const found_components: Record<string, { component: Component; inputs: Record<string, string[]> }> = {};
    const implicit_dependencies: Record<string, Record<string, string[]>> = {};
    await Promise.all(
      Object.entries(this.components || {})
        .filter(([_, component_config]) => component_config.source)
        .map(async ([component_key, component_config]) => {
          if (component_config.source?.startsWith('file:')) {
            const source = component_config.source.replace(/^file:/, '');
            try {
              const component = await parseComponent(source);
              found_components[component_key] = { component, inputs: {} };
              for (
                const dependency of component.getDependencies(graph, {
                  environment: environment_name,
                  component: {
                    name: component_key,
                    source,
                    debug: debug,
                  },
                })
              ) {
                implicit_dependencies[dependency.component] = implicit_dependencies[dependency.component] || {};
                for (const [inputKey, inputValues] of Object.entries(dependency.inputs || {})) {
                  implicit_dependencies[dependency.component][inputKey] =
                    implicit_dependencies[dependency.component][inputKey] || [];
                  implicit_dependencies[dependency.component][inputKey].push(...inputValues);
                }
              }
            } catch (err) {
              throw new Error(`Failed to load component: ${source}`);
            }
          } else if (component_config.source) {
            try {
              const component = await componentStore.getComponentConfig(component_config.source);
              found_components[component_key] = { component, inputs: {} };
              for (
                const dependency of component.getDependencies(graph, {
                  environment: environment_name,
                  component: {
                    name: component_key,
                    source: component_config.source,
                    debug: debug,
                  },
                })
              ) {
                implicit_dependencies[dependency.component] = implicit_dependencies[dependency.component] || {};
                for (const [inputKey, inputValues] of Object.entries(dependency.inputs || {})) {
                  implicit_dependencies[dependency.component][inputKey] =
                    implicit_dependencies[dependency.component][inputKey] || [];
                  implicit_dependencies[dependency.component][inputKey].push(...inputValues);
                }
              }
            } catch (err) {
              throw new Error(`Failed to get component: ${component_config.source}`);
            }
          }
        }),
    );

    // Populate implicit dependencies
    while (Object.keys(implicit_dependencies).length > 0) {
      const [name, inputs] = Object.entries(implicit_dependencies).shift()!;
      delete implicit_dependencies[name];

      const component = await componentStore.getComponentConfig(`${name}:latest`);
      found_components[name] = found_components[name] || { component, inputs: {} };
      for (const [inputKey, inputValues] of Object.entries(inputs)) {
        found_components[name].inputs[inputKey] = found_components[name].inputs[inputKey] || [];
        found_components[name].inputs[inputKey].push(...inputValues);
      }

      const component_config = this.components?.[name];
      let source = component_config?.source || name;
      if (source.startsWith('file:')) {
        source = source.replace(/^file:/, '');
        if (source.endsWith('architect.yml')) {
          source = path.dirname(source);
        }
      }

      for (
        const dependency of component.getDependencies(graph, {
          environment: environment_name,
          component: {
            name: name,
            source,
            debug: debug,
          },
        })
      ) {
        implicit_dependencies[dependency.component] = implicit_dependencies[dependency.component] || {};
        for (const [inputKey, inputValues] of Object.entries(dependency.inputs || {})) {
          implicit_dependencies[dependency.component][inputKey] =
            implicit_dependencies[dependency.component][inputKey] || [];
          implicit_dependencies[dependency.component][inputKey].push(...inputValues);
        }
      }
    }

    // Insert graph resources from found components
    Object.entries(found_components).map(([key, config]) => {
      const component_config = this.components?.[key];
      let source = component_config?.source || key;
      if (source.startsWith('file:')) {
        source = source.replace(/^file:/, '');
        if (source.endsWith('architect.yml')) {
          source = path.dirname(source);
        }
      }
      const component_graph = config.component.getGraph({
        component: {
          name: key,
          source,
          debug: debug,
        },
        environment: environment_name,
      });

      component_graph.insertNodes(
        ...component_graph.nodes
          .filter((node) => {
            if (
              node.type === 'deployment' &&
              component_config?.deployments?.[node.name] &&
              'enabled' in component_config.deployments[node.name]
            ) {
              return component_config.deployments[node.name].enabled;
            }

            return true;
          })
          .map((node) => {
            switch (node.type) {
              case 'deployment': {
                return this.enrichDeployment(node as AppGraphNode<'deployment'>);
              }
              case 'service': {
                return this.enrichService(node as AppGraphNode<'service'>);
              }
              case 'ingress': {
                return this.enrichIngressRule(node as AppGraphNode<'ingress'>);
              }
              case 'secret': {
                return this.enrichSecret(node as AppGraphNode<'secret'>, config.inputs[node.name]);
              }
              default: {
                return node;
              }
            }
          }),
      );

      graph.insertNodes(...component_graph.nodes);
      graph.insertEdges(...component_graph.edges);
    });

    return graph;
  }

  public addComponent(metadata: ComponentMetadata): void {
    this.components = this.components || {};
    this.components[metadata.image.repository] = this.components[metadata.image.repository] || {};
    this.components[metadata.image.repository].source = metadata.path
      ? `file:${metadata.path}`
      : metadata.image.toString().replace(/:latest$/, '');
    for (const [key, subdomain] of Object.entries(metadata.ingresses || {})) {
      this.components[metadata.image.repository].ingresses = this.components[metadata.image.repository].ingresses || {};
      this.components[metadata.image.repository].ingresses![key] = {
        subdomain,
      };
    }
  }

  public removeComponent(name: string): void {
    if (this.components?.[name]) {
      delete this.components![name];
    }
  }
}
