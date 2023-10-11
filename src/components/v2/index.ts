import { deepMerge } from 'std/collections/deep_merge.ts';
import * as path from 'std/path/mod.ts';
import { ResourceInputs } from '../../@resources/index.ts';
import { AppGraph, AppGraphNode, GraphEdge } from '../../graphs/index.ts';
import {
  Component,
  ComponentDependencies,
  DockerBuildFn,
  DockerPushFn,
  DockerTagFn,
  GraphContext,
  VolumeBuildFn,
  VolumeTagFn,
} from '../component.ts';
import { ComponentSchema } from '../schema.ts';
import { DebuggableBuildSchemaV2 } from './build.ts';
import { DependencySchemaV2 } from './dependency.ts';
import { DebuggableDeploymentSchemaV2 } from './deployment.ts';
import { parseExpressionRefs } from './expressions.ts';

export default class ComponentV2 extends Component {
  /**
   * A set of other components that this component depends on
   */
  dependencies?: Record<string, string | DependencySchemaV2>;

  /**
   * A set of inputs the component expects to be provided
   */
  variables?: Record<string, {
    /**
     * A human-readable description
     */
    description?: string;

    /**
     * A default value to use if one isn't provided
     */
    default?: string | string[];

    /**
     * If true, a value is required or the component won't run.
     *
     * @default false
     */
    required?: boolean;

    /**
     * If true, upstream components can pass in values that will be merged together
     * with each other and environment-provided values
     *
     * @default false
     */
    merge?: boolean;

    /**
     * Whether or not the data should be considered sensitive and stripped from logs
     *
     * @default false
     */
    sensitive?: boolean;
  }>;

  /**
   * A set of databases that this component requires
   */
  databases?: Record<
    string,
    {
      type: string;
      description?: string;
      migrate?: {
        image: string;
        entrypoint?: string | string[];
        command?: string | string[];
        environment?: Record<string, string | number | boolean | null | undefined>;
      };
      seed?: {
        image: string;
        entrypoint?: string | string[];
        command?: string | string[];
        environment?: Record<string, string | number | boolean | null | undefined>;
      };
    }
  >;

  /**
   * A set of build jobs to run to power other deployments or tasks
   */
  builds?: Record<string, DebuggableBuildSchemaV2>;

  /**
   * Workloads that should be deployed
   */
  deployments?: Record<
    string,
    DebuggableDeploymentSchemaV2
  >;

  /**
   * Services that can receive network traffic
   */
  services?: Record<
    string,
    {
      /**
       * Description of the service
       */
      description?: string;

      /**
       * Deployment the service sends requests to
       */
      deployment: string;

      /**
       * Port the service listens on
       */
      port: number;

      /**
       * Protocol the service listens on
       * @default http
       */
      protocol?: string;

      /**
       * Basic auth username
       */
      username?: string;

      /**
       * Basic auth password
       */
      password?: string;
    }
  >;

  /**
   * Claims for external (e.g. client) access to a service
   */
  ingresses?: Record<
    string,
    {
      /**
       * Service the ingress rule forwards traffic to
       */
      service: string;

      /**
       * Whether or not the ingress rule should be attached to an internal gateway
       */
      internal?: boolean;

      /**
       * Additional headers to include in responses
       */
      headers?: Record<string, string>;
    }
  >;

  private get normalizedDependencies(): Record<string, DependencySchemaV2> {
    const dependencies = this.dependencies || {};

    for (const [key, value] of Object.entries(dependencies)) {
      if (typeof value === 'string') {
        dependencies[key] = {
          component: value,
        };
      }
    }

    return dependencies as Record<string, DependencySchemaV2>;
  }

  private addBuildsToGraph(graph: AppGraph, context: GraphContext): AppGraph {
    for (const [build_key, build_config] of Object.entries(this.builds || {})) {
      if (build_config.image) {
        this.deployments = JSON.parse(
          JSON.stringify(this.deployments || {}).replace(
            new RegExp('\\${{\\s?builds\\.' + build_key + '\\.id\\s?}}', 'g'),
            () => build_config.image!,
          ),
        );
      } else {
        const build_node = new AppGraphNode({
          name: build_key,
          type: 'dockerBuild',
          component: context.component.name,
          inputs: {
            repository: context.component.name,
            component_source: context.component.source,
            context: context.component.debug &&
                build_config.debug &&
                build_config.debug.context
              ? build_config.debug.context
              : build_config.context,
            dockerfile: context.component.debug &&
                build_config.debug &&
                build_config.debug.dockerfile
              ? build_config.debug.dockerfile
              : build_config.dockerfile || 'Dockerfile',
            args: context.component.debug &&
                build_config.debug &&
                build_config.debug.args
              ? build_config.debug.args
              : build_config.args || {},
            ...(context.component.debug &&
                build_config.debug &&
                build_config.debug.target
              ? {
                target: build_config.debug.target,
              }
              : build_config.target
              ? {
                target: build_config.target,
              }
              : {}),
          },
        });

        build_node.inputs = parseExpressionRefs(
          graph,
          this.normalizedDependencies,
          context,
          build_node.getId(),
          build_node.inputs,
        );
        graph.insertNodes(build_node);
      }
    }

    return graph;
  }

  private addVariablestoGraph(
    graph: AppGraph,
    context: GraphContext,
  ): AppGraph {
    for (const [variable_key, variable_config] of Object.entries(this.variables || {})) {
      const secret_node = new AppGraphNode({
        name: variable_key,
        type: 'secret',
        component: context.component.name,
        inputs: {
          name: `${context.component.name}/${variable_key}`,
          data: variable_config.default && Array.isArray(variable_config.default)
            ? JSON.stringify(variable_config.default)
            : variable_config.default || '',
          ...(variable_config.required ? { required: variable_config.required } : {}),
          ...(variable_config.merge ? { merge: variable_config.merge } : {}),
          ...(variable_config.sensitive ? { sensitive: variable_config.sensitive } : {}),
        },
      });

      secret_node.inputs = parseExpressionRefs(
        graph,
        this.normalizedDependencies,
        context,
        secret_node.getId(),
        secret_node.inputs,
      );

      graph.insertNodes(secret_node);
    }
    return graph;
  }

  private addDatabasesToGraph(
    graph: AppGraph,
    context: GraphContext,
  ): AppGraph {
    for (
      const [database_key, database_config] of Object.entries(
        this.databases || {},
      )
    ) {
      if (!database_config.type.includes(':')) {
        throw new Error(`Invalid database type. Must be of the format, <engine>:<version>`);
      }

      const [engine, version] = database_config.type.split(':');
      const database_schema_node = new AppGraphNode({
        name: database_key,
        type: 'database',
        component: context.component.name,
        inputs: {
          name: `${context.component.name}/${database_key}`,
          databaseType: engine,
          databaseVersion: version,
        },
      });
      graph.insertNodes(database_schema_node);
    }

    return graph;
  }

  private addDeploymentsToGraph(
    graph: AppGraph,
    context: GraphContext,
  ): AppGraph {
    for (
      const [deployment_key, deployment_config] of Object.entries(
        this.deployments || {},
      )
    ) {
      const volume_node_ids: string[] = [];
      const volume_mounts: ResourceInputs['deployment']['volume_mounts'] = [];

      let volumes = deployment_config.volumes || {};
      if (context.component.debug && deployment_config.debug?.volumes) {
        volumes = deepMerge(
          volumes,
          deployment_config.debug.volumes as any,
        );
      }
      for (const [volumeKey, volumeConfig] of Object.entries(volumes)) {
        let host_path = undefined;

        try {
          const is_directory = Deno.statSync(context.component.source).isDirectory;
          if (volumeConfig.host_path && !is_directory) {
            host_path = path.join(path.dirname(context.component.source), volumeConfig.host_path);
          } else if (volumeConfig.host_path) {
            host_path = path.join(context.component.source, volumeConfig.host_path);
          }
        } catch {
          // Source is remote, so no host path
        }

        const volume_node = new AppGraphNode({
          name: `${deployment_key}-${volumeKey}`,
          type: 'volume',
          component: context.component.name,
          inputs: {
            name: `${context.component.name}/${deployment_key}-${volumeKey}`,
            hostPath: host_path,
          },
        });

        volume_mounts.push({
          volume: `\${{ ${volume_node.getId()}.id }}`,
          mount_path: volumeConfig.mount_path!,
          image: volumeConfig.image,
          readonly: false,
        });

        graph.insertNodes(volume_node);
        volume_node_ids.push(volume_node.getId());
      }

      const image = context.component.debug && deployment_config.debug?.image
        ? deployment_config.debug.image
        : deployment_config.image;
      const command = context.component.debug && deployment_config.debug?.command
        ? deployment_config.debug.command as string | string[]
        : deployment_config.command;
      const entrypoint = context.component.debug && deployment_config.debug?.entrypoint
        ? deployment_config.debug.entrypoint as string | string[]
        : deployment_config.entrypoint;

      const environment = context.component.debug && deployment_config.debug?.environment
        ? deepMerge(deployment_config.environment || {}, deployment_config.debug.environment)
        : deployment_config.environment;
      const cpu = context.component.debug && deployment_config.debug?.cpu
        ? deployment_config.debug.cpu
        : deployment_config.cpu;
      const memory = context.component.debug && deployment_config.debug?.memory
        ? deployment_config.debug.memory
        : deployment_config.memory;
      const liveness = context.component.debug && deployment_config.debug?.probes?.liveness
        ? deployment_config.debug.probes.liveness
        : deployment_config.probes?.liveness;

      const deployment_node = new AppGraphNode({
        name: deployment_key,
        type: 'deployment',
        component: context.component.name,
        inputs: {
          name: `${context.component.name}/${deployment_key}`,
          image,
          ...(deployment_config.platform ? { platform: deployment_config.platform } : {}),
          ...(environment ? { environment } : {}),
          ...(command ? { command } : {}),
          ...(entrypoint ? { entrypoint } : {}),
          ...(cpu ? { cpu: Number(cpu) } : {}),
          ...(memory ? { memory } : {}),
          ...(liveness ? { liveness } : {}),
          volume_mounts,
          replicas: 1,
        },
      });

      deployment_node.inputs = parseExpressionRefs(
        graph,
        this.normalizedDependencies,
        context,
        deployment_node.getId(),
        deployment_node.inputs,
      );
      graph.insertNodes(deployment_node);

      for (const volume of volume_node_ids) {
        graph.insertEdges(
          new GraphEdge({
            from: deployment_node.getId(),
            to: volume,
          }),
        );
      }
    }

    return graph;
  }

  private addServicesToGraph(
    graph: AppGraph,
    context: GraphContext,
  ): AppGraph {
    for (
      const [service_key, service_config] of Object.entries(
        this.services || {},
      )
    ) {
      const service_node = new AppGraphNode({
        name: service_key,
        type: 'service',
        component: context.component.name,
        inputs: {
          name: `${context.component.name}/${service_key}`,
          target_protocol: service_config.protocol || 'http',
          target_deployment: `${context.component.name}/${service_config.deployment}`,
          target_port: service_config.port,
          username: service_config.username,
          password: service_config.password,
        },
      });

      service_node.inputs = parseExpressionRefs(
        graph,
        this.normalizedDependencies,
        context,
        service_node.getId(),
        service_node.inputs,
      );
      graph.insertNodes(service_node);

      const deployment_node_id = `${context.component.name}/deployment/${service_config.deployment}`;

      const deployment_node = graph.nodes.find((n) => n.getId() === deployment_node_id);
      if (!deployment_node) {
        throw new Error(`No deployment named ${service_config.deployment}. Referenced by the service, ${service_key}`);
      }

      // Update deployment node with service references
      (deployment_node as AppGraphNode<'deployment'>).inputs.services =
        (deployment_node as AppGraphNode<'deployment'>).inputs.services || [];
      (deployment_node as AppGraphNode<'deployment'>).inputs.services!.push({
        id: `\${{ ${service_node.getId()}.id }}`,
        account: `\${{ ${service_node.getId()}.account }}`,
        port: `\${{ ${service_node.getId()}.target_port }}`,
      });
      graph.insertNodes(deployment_node);

      graph.insertEdges(
        new GraphEdge({
          from: deployment_node.getId(),
          to: service_node.getId(),
        }),
      );
    }

    return graph;
  }

  private addIngressesToGraph(
    graph: AppGraph,
    context: GraphContext,
  ): AppGraph {
    for (
      const [ingress_key, ingress_config] of Object.entries(
        this.ingresses || {},
      )
    ) {
      const service_node = graph.nodes.find(
        (n) => n.name === ingress_config.service && n.type === 'service',
      ) as AppGraphNode<'service'> | undefined;
      if (!service_node) {
        throw new Error(`The service, ${ingress_config.service}, does not exist`);
      }

      graph.insertNodes(service_node);

      const ingress_node = new AppGraphNode({
        name: ingress_key,
        type: 'ingress',
        component: context.component.name,
        inputs: {
          name: `${context.component.name}/${ingress_key}`,
          registry: '',
          port: `\${{ ${service_node.getId()}.port }}`,
          service: `\${{ ${service_node.getId()}.id }}`,
          protocol: `\${{ ${service_node.getId()}.protocol }}`,
          username: `\${{ ${service_node.getId()}.username }}`,
          password: `\${{ ${service_node.getId()}.password }}`,
          internal: ingress_config.internal || false,
          headers: ingress_config.headers || {},
        },
      });

      ingress_node.inputs = parseExpressionRefs(
        graph,
        this.normalizedDependencies,
        context,
        ingress_node.getId(),
        ingress_node.inputs,
      );
      graph.insertNodes(ingress_node);
      graph.insertEdges(
        new GraphEdge({
          from: ingress_node.getId(),
          to: service_node.getId(),
        }),
      );
    }

    return graph;
  }

  constructor(data: ComponentSchema) {
    super();
    Object.assign(this, data);
  }

  public getDependencies(graph: AppGraph, context: GraphContext): ComponentDependencies {
    return Object.values(this.normalizedDependencies).map((dependency) => {
      const inputs: ComponentDependencies[number]['inputs'] = {};
      for (const [key, value] of Object.entries(dependency.variables || {})) {
        const from_id = `${dependency.component}/secret/${key}`;

        if (Array.isArray(value)) {
          inputs[key] = value;
        } else {
          inputs[key] = [value];
        }

        inputs[key] = parseExpressionRefs(graph, this.normalizedDependencies, context, from_id, inputs[key]);
      }

      return {
        component: dependency.component,
        inputs,
      };
    });
  }

  public getGraph(context: GraphContext): AppGraph {
    let graph = new AppGraph();
    graph = this.addVariablestoGraph(graph, context);
    graph = this.addBuildsToGraph(graph, context);
    graph = this.addDatabasesToGraph(graph, context);
    graph = this.addDeploymentsToGraph(graph, context);
    graph = this.addServicesToGraph(graph, context);
    graph = this.addIngressesToGraph(graph, context);
    return graph;
  }

  public async build(buildFn: DockerBuildFn, volumeBuildFn: VolumeBuildFn): Promise<Component> {
    for (const [buildName, buildConfig] of Object.entries(this.builds || {})) {
      const digest = await buildFn({
        context: buildConfig.context,
        dockerfile: buildConfig.dockerfile,
        args: buildConfig.args,
        target: buildConfig.target,
      });

      this.builds![buildName].image = digest;
    }

    for (const [deploymentName, deploymentConfig] of Object.entries(this.deployments || {})) {
      for (const [volumeName, volumeConfig] of Object.entries(deploymentConfig.volumes || {})) {
        if (volumeConfig.host_path) {
          volumeConfig.image = await volumeBuildFn({
            host_path: volumeConfig.host_path,
            volume_name: volumeName,
            deployment_name: deploymentName,
          });
        }
      }

      delete this.deployments?.[deploymentName].debug;
    }

    return this;
  }

  public async tag(tagFn: DockerTagFn, volumeTagFn: VolumeTagFn): Promise<Component> {
    for (const [buildName, buildConfig] of Object.entries(this.builds || {})) {
      if (buildConfig.image) {
        const newTag = await tagFn(buildConfig.image, buildName);
        this.builds![buildName].image = newTag;
      }
    }

    for (const [deploymentName, deploymentConfig] of Object.entries(this.deployments || {})) {
      for (const [volumeName, volumeConfig] of Object.entries(deploymentConfig.volumes || {})) {
        if (volumeConfig.image) {
          deploymentConfig.volumes![volumeName].image = await volumeTagFn(
            volumeConfig.image,
            deploymentName,
            volumeName,
          );
        }
      }
    }

    return this;
  }

  public async push(pushFn: DockerPushFn): Promise<Component> {
    for (const buildConfig of Object.values(this.builds || {})) {
      if (buildConfig.image) {
        await pushFn(buildConfig.image);
      }
    }

    for (const deploymentConfig of Object.values(this.deployments || {})) {
      for (const volumeConfig of Object.values(deploymentConfig.volumes || {})) {
        if (volumeConfig.image && volumeConfig.host_path) {
          await pushFn(volumeConfig.image);
        }
      }
    }

    return this;
  }
}
