import { CloudEdge, CloudGraph, CloudNode } from '../../cloud-graph/index.ts';
import {
  Component,
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
import { parseExpressionRefs } from './expressions.ts';
import { ProbeSchema } from './probe.ts';

export default class ComponentV2 extends Component {
  /**
   * A set of other components that this component depends on
   */
  dependencies?: Record<string, string>;

  /**
   * A set of secrets that this component requires
   */
  secrets?: Record<string, {
    description?: string;
    default?: string;
    required?: boolean;
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
    {
      description?: string;
      image: string;
      command?: string | string[];
      entrypoint?: string | string[];
      environment?: Record<string, string>;
      cpu?: number | string;
      memory?: string;
      labels?: Record<string, string>;
      probes?: {
        liveness?: ProbeSchema;
      };
      autoscaling?: {
        cpu?: number | string;
        memory?: string;
      };
      volumes?: Record<string, {
        host_path: string;
        mount_path: string;
        digest?: string;
      }>;
    }
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

  private addBuildsToGraph(graph: CloudGraph, context: GraphContext): CloudGraph {
    for (const [build_key, build_config] of Object.entries(this.builds || {})) {
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
              build_config.debug.context
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

      graph.insertNodes(parseExpressionRefs(graph, this.dependencies || {}, context, build_node));
    }

    return graph;
  }

  private addSecretsToGraph(
    graph: CloudGraph,
    context: GraphContext,
  ): CloudGraph {
    for (const [secret_key, secret_config] of Object.entries(this.secrets || {})) {
      const secret_node = new CloudNode({
        name: secret_key,
        component: context.component.name,
        environment: context.environment,
        inputs: {
          type: 'secret',
          name: CloudNode.genResourceId({
            name: secret_key,
            component: context.component.name,
            environment: context.environment,
          }),
          data: secret_config.default || '',
          required: secret_config.required || false,
        },
      });
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

  private getDeploymentVolumes(
    tag: string,
    deployment_name: string,
    volumes: Record<string, {
      host_path: string;
      mount_path: string;
      digest?: string;
    }>,
  ): {
    name: string;
    mount_path: string;
    digest: string;
    readonly: boolean;
  }[] {
    const deployment_volumes = [];
    const [repo_name, repo_tag] = tag.split(':');
    for (const [volume_key, volume_config] of Object.entries(volumes)) {
      deployment_volumes.push({
        name: volume_key,
        volume: `${repo_name.replaceAll('/', '-').replaceAll('.', '-')}-${deployment_name}-volumes-${volume_key}`,
        mount_path: volume_config.mount_path,
        digest: `${repo_name}/${deployment_name}/volume/${volume_key}:${repo_tag}`,
        readonly: true,
      });
    }
    return deployment_volumes;
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
          image: deployment_config.image,
          ...(deployment_config.command ? { command: deployment_config.command } : {}),
          ...(deployment_config.entrypoint ? { entrypoint: deployment_config.entrypoint } : {}),
          ...(deployment_config.environment ? { environment: deployment_config.environment } : {}),
          ...(deployment_config.cpu ? { cpu: deployment_config.cpu as number } : {}),
          ...(deployment_config.memory ? { memory: deployment_config.memory } : {}),
          ...(deployment_config.probes
            ? {
              ...(deployment_config.probes.liveness ? { liveness: deployment_config.probes.liveness } : {}),
            }
            : {}),
          volume_mounts: this.getDeploymentVolumes(
            context.component.source,
            deployment_key,
            deployment_config.volumes || {},
          ),
          replicas: 1,
        },
      });

      graph.insertNodes(parseExpressionRefs(graph, this.dependencies || {}, context, deployment_node));
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
        },
      });

      graph.insertNodes(parseExpressionRefs(graph, this.dependencies || {}, context, service_node));
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
          subdomain: ingress_key,
          port: `\${{ ${service_node.id}.port }}`,
          service: `\${{ ${service_node.id}.id }}`,
          path: '/',
          protocol: `\${{ ${service_node.id}.protocol }}`,
          internal: ingress_config.internal || false,
        },
      });
      graph.insertNodes(parseExpressionRefs(graph, this.dependencies || {}, context, ingress_node));
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

  public getDependencies(): string[] {
    return Object.values(this.dependencies || {});
  }

  public getGraph(context: GraphContext): CloudGraph {
    let graph = new CloudGraph();
    graph = this.addSecretsToGraph(graph, context);
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
        volumeConfig.digest = await volumeBuildFn({
          host_path: volumeConfig.host_path,
          volume_name: volumeName,
          deployment_name: deploymentName,
        });
      }
    }

    return this;
  }

  public async tag(tagFn: DockerTagFn, volumeTagFn: VolumeTagFn): Promise<Component> {
    for (const [buildName, buildConfig] of Object.entries(this.builds || {})) {
      if (buildConfig.image) {
        this.builds![buildName].image = await tagFn(buildConfig.image, buildName);
      }
    }

    for (const [deploymentName, deploymentConfig] of Object.entries(this.deployments || {})) {
      for (const [volumeName, volumeConfig] of Object.entries(deploymentConfig.volumes || {})) {
        if (volumeConfig.digest) {
          deploymentConfig.volumes![volumeName].digest = await volumeTagFn(
            volumeConfig.digest,
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
        if (volumeConfig.digest) {
          await volumePushFn(deploymentName, volumeName, volumeConfig.digest);
        }
      }
    }

    return this;
  }
}
