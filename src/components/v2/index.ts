import { deepMerge } from 'std/collections/deep_merge.ts';
import * as path from 'std/path/mod.ts';
import { ResourceInputs } from '../../@resources/index.ts';
import { CloudEdge, CloudGraph, CloudNode } from '../../cloud-graph/index.ts';
import {
  Component,
  ComponentDependencies,
  DockerBuildFn,
  DockerPushFn,
  DockerTagFn,
  GraphContext,
  VolumeBuildFn,
  VolumePushFn,
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
      service: string;
      internal?: boolean;
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

  private addBuildsToGraph(graph: CloudGraph, context: GraphContext): CloudGraph {
    for (const [build_key, build_config] of Object.entries(this.builds || {})) {
      if (build_config.image) {
        this.deployments = JSON.parse(
          JSON.stringify(this.deployments || {}).replace(
            new RegExp('\\${{\\s?builds\\.' + build_key + '\\.id\\s?}}', 'g'),
            () => build_config.image!,
          ),
        );
      } else {
        const build_node = new CloudNode({
          name: build_key,
          component: context.component.name,
          environment: context.environment,
          inputs: {
            type: 'dockerBuild',
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
          build_node.id,
          build_node.inputs,
        );
        graph.insertNodes(build_node);
      }
    }

    return graph;
  }

  private addVariablestoGraph(
    graph: CloudGraph,
    context: GraphContext,
  ): CloudGraph {
    for (const [variable_key, variable_config] of Object.entries(this.variables || {})) {
      const secret_node = new CloudNode({
        name: variable_key,
        component: context.component.name,
        environment: context.environment,
        inputs: {
          type: 'secret',
          name: CloudNode.genResourceId({
            name: variable_key,
            component: context.component.name,
            environment: context.environment,
          }),
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
        secret_node.id,
        secret_node.inputs,
      );

      graph.insertNodes(secret_node);
    }
    return graph;
  }

  private addDatabasesToGraph(
    graph: CloudGraph,
    context: GraphContext,
  ): CloudGraph {
    for (
      const [database_key, database_config] of Object.entries(
        this.databases || {},
      )
    ) {
      if (!database_config.type.includes(':')) {
        throw new Error(`Invalid database type. Must be of the format, <engine>:<version>`);
      }

      const [engine, version] = database_config.type.split(':');
      const database_schema_node = new CloudNode({
        name: database_key,
        component: context.component.name,
        environment: context.environment,
        inputs: {
          type: 'databaseSchema',
          name: CloudNode.genResourceId({
            name: database_key,
            component: context.component.name,
            environment: context.environment,
          }),
          database: '',
          databaseType: engine,
          databaseVersion: version,
        },
      });
      graph.insertNodes(database_schema_node);
    }

    return graph;
  }

  private addDeploymentsToGraph(
    graph: CloudGraph,
    context: GraphContext,
  ): CloudGraph {
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
        const is_directory = Deno.statSync(context.component.source).isDirectory;
        let host_path = undefined;
        if (volumeConfig.host_path && !is_directory) {
          host_path = path.join(path.dirname(context.component.source), volumeConfig.host_path);
        } else if (volumeConfig.host_path) {
          host_path = path.join(context.component.source, volumeConfig.host_path);
        }

        const volume_node = new CloudNode({
          name: `${deployment_key}-${volumeKey}`,
          component: context.component.name,
          environment: context.environment,
          inputs: {
            type: 'volume',
            name: CloudNode.genResourceId({
              name: `${deployment_key}-${volumeKey}`,
              component: context.component.name,
              environment: context.environment,
            }),
            hostPath: host_path,
          },
        });

        volume_mounts.push({
          volume: `\${{ ${volume_node.id}.id }}`,
          mount_path: volumeConfig.mount_path!,
          remote_image: volumeConfig.image,
          readonly: false,
        });

        graph.insertNodes(volume_node);
        volume_node_ids.push(volume_node.id);
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

      const deployment_node = new CloudNode({
        name: deployment_key,
        component: context.component.name,
        environment: context.environment,
        inputs: {
          type: 'deployment',
          name: CloudNode.genResourceId({
            name: deployment_key,
            component: context.component.name,
            environment: context.environment,
          }),
          image,
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
        deployment_node.id,
        deployment_node.inputs,
      );
      graph.insertNodes(deployment_node);

      for (const volume of volume_node_ids) {
        graph.insertEdges(
          new CloudEdge({
            required: true,
            from: deployment_node.id,
            to: volume,
          }),
        );
      }
    }

    return graph;
  }

  private addServicesToGraph(
    graph: CloudGraph,
    context: GraphContext,
  ): CloudGraph {
    for (
      const [service_key, service_config] of Object.entries(
        this.services || {},
      )
    ) {
      const service_node = new CloudNode({
        name: service_key,
        component: context.component.name,
        environment: context.environment,
        inputs: {
          type: 'service',
          name: CloudNode.genResourceId({
            name: service_key,
            component: context.component.name,
            environment: context.environment,
          }),
          target_protocol: service_config.protocol || 'http',
          target_deployment: CloudNode.genResourceId({
            name: service_config.deployment,
            component: context.component.name,
            environment: context.environment,
          }),
          target_port: service_config.port,
          username: service_config.username,
          password: service_config.password,
        },
      });

      service_node.inputs = parseExpressionRefs(
        graph,
        this.normalizedDependencies,
        context,
        service_node.id,
        service_node.inputs,
      );
      graph.insertNodes(service_node);
      graph.insertEdges(
        new CloudEdge({
          from: service_node.id,
          to: CloudNode.genId({
            type: 'deployment',
            name: service_config.deployment,
            component: context.component.name,
            environment: context.environment,
          }),
          required: false,
        }),
      );
    }

    return graph;
  }

  private addIngressesToGraph(
    graph: CloudGraph,
    context: GraphContext,
  ): CloudGraph {
    for (
      const [ingress_key, ingress_config] of Object.entries(
        this.ingresses || {},
      )
    ) {
      const service_node = graph.nodes.find(
        (n) => n.name === ingress_config.service && n.type === 'service',
      ) as CloudNode<'service'> | undefined;
      if (!service_node) {
        throw new Error(`The service, ${ingress_config.service}, does not exist`);
      }

      graph.insertNodes(service_node);

      const ingress_node = new CloudNode({
        name: ingress_key,
        component: context.component.name,
        environment: context.environment,
        inputs: {
          type: 'ingressRule',
          name: CloudNode.genResourceId({
            name: ingress_key,
            component: context.component.name,
            environment: context.environment,
          }),
          registry: '',
          port: `\${{ ${service_node.id}.port }}`,
          service: `\${{ ${service_node.id}.id }}`,
          protocol: `\${{ ${service_node.id}.protocol }}`,
          username: `\${{ ${service_node.id}.username }}`,
          password: `\${{ ${service_node.id}.password }}`,
          internal: ingress_config.internal || false,
        },
      });

      ingress_node.inputs = parseExpressionRefs(
        graph,
        this.normalizedDependencies,
        context,
        ingress_node.id,
        ingress_node.inputs,
      );
      graph.insertNodes(ingress_node);
      graph.insertEdges(
        new CloudEdge({
          from: ingress_node.id,
          to: service_node.id,
          required: true,
        }),
      );
    }

    return graph;
  }

  constructor(data: ComponentSchema) {
    super();
    Object.assign(this, data);
  }

  public getDependencies(graph: CloudGraph, context: GraphContext): ComponentDependencies {
    return Object.values(this.normalizedDependencies).map((dependency) => {
      const inputs: ComponentDependencies[number]['inputs'] = {};
      for (const [key, value] of Object.entries(dependency.variables || {})) {
        const from_id = CloudNode.genId({
          type: 'secret',
          name: key,
          component: dependency.component,
          environment: context.environment,
        });

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

  public getGraph(context: GraphContext): CloudGraph {
    let graph = new CloudGraph();
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

  public async push(pushFn: DockerPushFn, volumePushFn: VolumePushFn): Promise<Component> {
    for (const buildConfig of Object.values(this.builds || {})) {
      if (buildConfig.image) {
        await pushFn(buildConfig.image);
      }
    }

    for (const [deploymentName, deploymentConfig] of Object.entries(this.deployments || {})) {
      for (const [volumeName, volumeConfig] of Object.entries(deploymentConfig.volumes || {})) {
        if (volumeConfig.image && volumeConfig.host_path) {
          await volumePushFn(
            deploymentName,
            volumeName,
            volumeConfig.image,
            volumeConfig.host_path,
            volumeConfig.mount_path,
          );
        }
      }
    }

    return this;
  }
}
