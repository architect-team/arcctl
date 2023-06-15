import { CloudGraph, CloudNode } from '../../cloud-graph/index.ts';
import type { ComponentStore } from '../../component-store/index.ts';
import { Component, parseComponent } from '../../components/index.ts';
import { ComponentMetadata, Environment } from '../environment.ts';

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
       * Values for secrets that should be passed to the component
       */
      secrets?: {
        [key: string]: string;
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

  private enrichDeployment(node: CloudNode<'deployment'>): CloudNode<'deployment'> {
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

  private enrichService(node: CloudNode<'service'>): CloudNode<'service'> {
    if (!node.component || !this.components) {
      return node;
    }

    const component_config = this.components[node.component];
    const service_config = component_config?.services?.[node.name];
    if (service_config?.host) {
      node.inputs = {
        ...node.inputs,
        external_hostname: service_config.host,
        target_port: service_config.port || node.inputs.target_port,
      };
    }

    return node;
  }

  private enrichIngressRule(node: CloudNode<'ingressRule'>): CloudNode<'ingressRule'> {
    if (!node.component || !this.components) {
      return node;
    }

    const component_config = this.components[node.component];
    const ingress_config = component_config?.ingresses?.[node.name];

    node.inputs.path = ingress_config?.path || node.inputs.path;
    node.inputs.subdomain = ingress_config?.subdomain || node.inputs.subdomain;
    node.inputs.internal = ingress_config?.internal || node.inputs.internal;

    return node;
  }

  private enrichSecret(node: CloudNode<'secret'>): CloudNode<'secret'> {
    if (!node.component || !this.components) {
      return node;
    }

    const component_config = this.components[node.component];
    if (!component_config) {
      return node;
    }
    const secret_config = component_config.secrets?.[node.name];

    node.inputs.data = secret_config || node.inputs.data;

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

  public async getGraph(environment_name: string, componentStore: ComponentStore, debug = false): Promise<CloudGraph> {
    const graph = new CloudGraph();

    // Replace all local values
    this.enrichLocal();

    // Populate explicit components
    const found_components: Record<string, Component> = {};
    const implicit_dependencies: string[] = [];
    await Promise.all(
      Object.entries(this.components || {})
        .filter(([_, component_config]) => component_config.source)
        .map(async ([component_key, component_config]) => {
          if (component_config.source?.startsWith('file:')) {
            const source = component_config.source.replace(/^file:/, '');
            try {
              const component = await parseComponent(source);
              found_components[component_key] = component;
              for (const dependency of component.getDependencies()) {
                if (!implicit_dependencies.includes(dependency) && !found_components[dependency]) {
                  implicit_dependencies.push(dependency);
                }
              }
            } catch (err) {
              console.error(err);
              throw new Error(`Failed to load component: ${source}`);
            }
          } else if (component_config.source) {
            try {
              const component = await componentStore.getComponentConfig(component_config.source);
              found_components[component_key] = component;
              for (const dependency of component.getDependencies()) {
                if (!implicit_dependencies.includes(dependency) && !found_components[dependency]) {
                  implicit_dependencies.push(dependency);
                }
              }
            } catch (err) {
              throw new Error(`Failed to get component: ${component_config.source}`);
            }
          }
        }),
    );

    // Populate implicit dependencies
    while (implicit_dependencies.length > 0) {
      const dependency_name = implicit_dependencies.shift()!;
      const component = await componentStore.getComponentConfig(`${dependency_name}:latest`);
      found_components[dependency_name] = component;
      for (const dependency of component.getDependencies()) {
        if (!implicit_dependencies.includes(dependency) && !found_components[dependency]) {
          implicit_dependencies.push(dependency);
        }
      }
    }

    // Insert graph resources from found components
    Object.entries(found_components).map(([key, component]) => {
      const component_config = this.components?.[key];
      const component_graph = component.getGraph({
        component: {
          name: key,
          source: component_config?.source || key,
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
                return this.enrichDeployment(node as CloudNode<'deployment'>);
              }
              case 'service': {
                return this.enrichService(node as CloudNode<'service'>);
              }
              case 'ingressRule': {
                return this.enrichIngressRule(node as CloudNode<'ingressRule'>);
              }
              case 'secret': {
                return this.enrichSecret(node as CloudNode<'secret'>);
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
    this.components[metadata.image.repository].source = metadata.image.toString().replace(/:latest$/, '');
    for (const [key, subdomain] of Object.entries(metadata.ingresses || {})) {
      this.components[metadata.image.repository].ingresses = this.components[metadata.image.repository].ingresses || {};
      this.components[metadata.image.repository].ingresses![key] = {
        subdomain,
      };
    }
  }
}
