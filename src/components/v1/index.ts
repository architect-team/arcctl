import { ResourceInputs } from '../../@resources/index.ts';
import { GraphEdge } from '../../graphs/edge.ts';
import { AppGraph, AppGraphNode } from '../../graphs/index.ts';
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
import { DatabaseSchemaV1 } from './database-schema-v1.ts';
import { DependencySchemaV1 } from './dependency-schema-v1.ts';
import { parseExpressionRefs } from './expressions.ts';
import { InterfaceSchemaV1 } from './interface-schema-v1.ts';
import { ParameterSchemaV1 } from './parameter-schema-v1.ts';
import { DebuggableServiceSchemaV1 } from './service-schema-v1.ts';
import { DebuggableStaticBucketSchemaV1 } from './static-schema-v1.ts';
import { DebuggableTaskSchemaV1 } from './task-schema-v1.ts';

/**
 * @title V1
 */
export default class ComponentV1 extends Component {
  /**
   * Unique name of the component. Must be of the format, <account-name>/<component-name>
   */
  name?: string;

  /**
   * A human-readable description of the component and what it should be used for
   */
  description?: string;

  /**
   * An array of keywords that can be used to index the component and make it discoverable for others
   */
  keywords?: string[];

  /**
   * A dictionary of named parameters that this component uses to configure services.
   *
   * Parameters can either be an object describing the parameter or a string shorthand that directly
   * applies to the `default` value.
   *
   * This is an alias for the `inputs` field.
   */
  parameters?: Record<string, ParameterSchemaV1>;

  /**
   * A dictionary of named parameters that this component uses to configure services.
   *
   * Parameters can either be an object describing the parameter or a string shorthand that directly
   * applies to the `default` value.
   *
   * This is an alias for the `inputs` field.
   */
  secrets?: Record<string, ParameterSchemaV1>;

  /**
   * A dictionary of named parameters that this component uses to configure services.
   *
   * Parameters can either be an object describing the parameter or a string shorthand that directly
   * applies to the `default` value.
   *
   * This is an alias for the `parameters` field.
   */
  variables?: Record<string, ParameterSchemaV1>;

  /**
   * A dictionary of named interfaces that the component makes available to upstreams, including
   * other components via dependencies or environments via interface mapping.
   *
   * Interfaces can either be an object describing the interface, or a string shorthand that
   * directly applies to the `url` value.
   */
  interfaces?: Record<string, string | InterfaceSchemaV1>;

  /**
   * A set of components and associated versions that this component depends on.
   */
  dependencies?: Record<
    string,
    string | DependencySchemaV1
  >;

  /**
   * A set of named services that need to be run and persisted in order to power this component.
   */
  services?: Record<string, DebuggableServiceSchemaV1>;

  /**
   * A set of scheduled and triggerable tasks that get registered alongside the component. Tasks are
   * great for data translation, reporting, and much more.
   */
  tasks?: Record<string, DebuggableTaskSchemaV1>;

  /**
   * A set of static asset buckets to create and load with content.
   */
  static?: Record<string, DebuggableStaticBucketSchemaV1>;

  /**
   * A set of databases required by the component
   */
  databases?: Record<string, DatabaseSchemaV1>;

  constructor(data: ComponentSchema) {
    super();
    Object.assign(this, data);
  }

  private addServicesToGraph(
    graph: AppGraph,
    context: GraphContext,
  ): AppGraph {
    for (
      const [service_name, service_config] of Object.entries(
        this.services || {},
      )
    ) {
      // Generate the image build node as-needed
      let image = '';
      const deployment_node_id = `${context.component.name}/deployment/${service_name}`;

      if (!('image' in service_config)) {
        const build_node = new AppGraphNode({
          name: service_name,
          type: 'dockerBuild',
          component: context.component.name,
          inputs: {
            component_source: context.component.source,
            context: context.component.debug &&
                service_config.debug &&
                'build' in service_config.debug &&
                service_config.debug.build?.context
              ? service_config.debug.build.context
              : service_config.build.context,
            dockerfile: context.component.debug &&
                service_config.debug &&
                'build' in service_config.debug &&
                service_config.debug.build?.dockerfile
              ? service_config.debug.build.dockerfile
              : service_config.build.dockerfile || 'Dockerfile',
            args: context.component.debug &&
                service_config.debug &&
                'build' in service_config.debug &&
                service_config.debug.build?.args
              ? (service_config.debug.build.args as Record<string, string>)
              : service_config.build.args || {},
            ...(context.component.debug &&
                service_config.debug &&
                'build' in service_config.debug &&
                service_config.debug.build?.target
              ? {
                target: service_config.debug.build.target,
              }
              : service_config.build.target
              ? {
                target: service_config.build.target,
              }
              : {}),
          },
        });

        build_node.inputs = parseExpressionRefs(graph, context, build_node.getId(), build_node.inputs);
        graph.insertNodes(build_node);
        graph.insertEdges(
          new GraphEdge({
            from: deployment_node_id,
            to: build_node.getId(),
          }),
        );

        image = `\${{ ${build_node.getId()}.id }}`;
      } else {
        image = service_config.image;
      }

      const deployment_node = new AppGraphNode({
        name: service_name,
        type: 'deployment',
        component: context.component.name,
        inputs: {
          name: `${context.component.name.replaceAll('/', '--')}--${service_name}`,
          replicas: Number(service_config.replicas || 1), // TODO: Ensure this is a number value
          ...(service_config.platform ? { platform: service_config.platform } : {}),
          ...(service_config.scaling
            ? {
              autoscaling: {
                min_replicas: Number(service_config.scaling.min_replicas),
                max_replicas: Number(service_config.scaling.max_replicas),
              },
            }
            : {}),
          image: image,
          ...(service_config.command ? { command: service_config.command } : {}),
          ...(service_config.entrypoint ? { entrypoint: service_config.entrypoint } : {}),
          ...(service_config.environment ? { environment: service_config.environment } : {}),
          ...(service_config.cpu ? { cpu: service_config.cpu as number } : {}),
          ...(service_config.memory ? { memory: service_config.memory } : {}),
          ...(service_config.liveness_probe ? { liveness_probe: service_config.liveness_probe } : {}),
          volume_mounts: Object.entries(service_config.volumes || {}).reduce(
            (mounts, [volume_name, volume_config]) => {
              const volume_node = new AppGraphNode({
                name: `${service_name}-${volume_name}`,
                type: 'volume',
                component: context.component.name,
                inputs: {
                  name: `${context.component.name}/${service_name}-${volume_name}`,
                  ...(volume_config.host_path ? { hostPath: volume_config.host_path } : {}),
                },
              });

              volume_node.inputs = parseExpressionRefs(graph, context, volume_node.getId(), volume_node.inputs);
              graph.insertNodes(
                volume_node,
              );
              graph.insertEdges(
                new GraphEdge({
                  from: deployment_node.getId(),
                  to: volume_node.getId(),
                }),
              );

              // Mount the volume to the deployment
              mounts = mounts || [];
              mounts.push({
                volume: `${volume_node.component}/${volume_node.name}`,
                mount_path: volume_config.mount_path!,
                readonly: volume_config.readonly ? Boolean(volume_config.readonly) : false,
              });
              return mounts;
            },
            [] as ResourceInputs['deployment']['volume_mounts'],
          ),
        },
      });

      // Insert the deployment node
      deployment_node.inputs = parseExpressionRefs(graph, context, deployment_node.getId(), deployment_node.inputs);
      graph.insertNodes(deployment_node);

      // Create and insert the service nodes for each interface
      for (
        const [interface_name, interface_config] of Object.entries(
          service_config.interfaces || {},
        )
      ) {
        const service_node = new AppGraphNode({
          name: `${service_name}-${interface_name}`,
          type: 'service',
          component: context.component.name,
          inputs: {
            deployment: `${deployment_node.component.replaceAll('/', '--')}--${deployment_node.name}`,
            protocol: typeof interface_config === 'object' && interface_config.protocol
              ? interface_config.protocol
              : 'http',
            port: Number(
              typeof interface_config === 'object' ? interface_config.port : interface_config,
            ),
          },
        });

        service_node.inputs = parseExpressionRefs(graph, context, service_node.getId(), service_node.inputs);
        graph.insertNodes(service_node);
        graph.insertEdges(
          new GraphEdge({
            from: service_node.getId(),
            to: deployment_node.getId(),
          }),
        );
        graph.insertEdges(
          new GraphEdge({
            from: deployment_node.getId(),
            to: service_node.getId(),
          }),
        );

        deployment_node.inputs.services = deployment_node.inputs.services || [];
        deployment_node.inputs.services?.push({
          name: `\${{ ${service_node.getId()}.name }}`,
          port: `\${{ ${service_node.getId()}.port }}`,
          target_port: `\${{ ${service_node.getId()}.target_port }}`,
          host: `\${{ ${service_node.getId()}.host }}`,
          protocol: `\${{ ${service_node.getId()}.protocol }}`,
        });

        if (typeof interface_config === 'object' && interface_config.ingress) {
          service_node.inputs = parseExpressionRefs(graph, context, service_node.getId(), service_node.inputs);
          graph.insertNodes(service_node);

          const ingress_node = new AppGraphNode({
            name: `${service_name}-${interface_name}`,
            type: 'ingress',
            component: context.component.name,
            inputs: {
              port: `\${{ ${service_node.getId()}.port }}`,
              ...(interface_config.ingress.subdomain ? { subdomain: interface_config.ingress.subdomain } : {}),
              ...(interface_config.ingress.path ? { path: interface_config.ingress.path } : {}),
              ...(interface_config.ingress.internal !== undefined
                ? { internal: interface_config.ingress.internal }
                : {}),
              protocol: `\${{ ${service_node.getId()}.protocol }}`,
              service: {
                name: `\${{ ${service_node.getId()}.name }}`,
                host: `\${{ ${service_node.getId()}.host }}`,
                port: `\${{ ${service_node.getId()}.port }}`,
                protocol: `\${{ ${service_node.getId()}.protocol }}`,
              },
              username: `\${{ ${service_node.getId()}.username }}`,
              password: `\${{ ${service_node.getId()}.password }}`,
              internal: false,
              path: '/',
            },
          });

          ingress_node.inputs = parseExpressionRefs(graph, context, ingress_node.getId(), ingress_node.inputs);
          graph.insertNodes(ingress_node);
          graph.insertEdges(
            new GraphEdge({
              from: ingress_node.getId(),
              to: service_node.getId(),
            }),
          );

          deployment_node.inputs.ingresses = deployment_node.inputs.ingresses || [];
          deployment_node.inputs.ingresses?.push({
            service: ingress_node.inputs.service.name,
            port: `\${{ ${ingress_node.getId()}.port }}`,
            host: `\${{ ${ingress_node.getId()}.host }}`,
            protocol: `\${{ ${ingress_node.getId()}.protocol }}`,
            path: `\${{ ${ingress_node.getId()}.path }}`,
            subdomain: `\${{ ${ingress_node.getId()}.subdomain }}`,
            dns_zone: `\${{ ${ingress_node.getId()}.dns_zone }}`,
          });

          graph.insertEdges(
            new GraphEdge({
              from: deployment_node.getId(),
              to: ingress_node.getId(),
            }),
          );
        }
      }

      // Update the deployment node with the service IDs
      graph.insertNodes(deployment_node);

      // Add edges for explicit depends_on
      for (const otherService of service_config.depends_on || []) {
        graph.insertEdges(
          new GraphEdge({
            from: deployment_node.getId(),
            to: `${context.component.name}/deployment/${otherService}`,
          }),
        );
      }
    }

    return graph;
  }

  private addTasksToGraph(
    graph: AppGraph,
    context: GraphContext,
  ): AppGraph {
    for (
      const [task_name, task_config] of Object.entries(
        this.tasks || {},
      ).filter(([_, task_config]) => task_config.schedule)
    ) {
      // Generate the image build node as-needed
      let image = '';
      if (!('image' in task_config)) {
        const cronjob_node_id = `${context.component.name}/cronjob/${task_name}`;

        const build_node = new AppGraphNode({
          name: task_name,
          type: 'dockerBuild',
          component: context.component.name,
          inputs: {
            component_source: context.component.source,
            context: context.component.debug &&
                task_config.debug &&
                'build' in task_config.debug &&
                task_config.debug.build?.context
              ? task_config.debug.build.context
              : task_config.build.context,
            dockerfile: context.component.debug &&
                task_config.debug &&
                'build' in task_config.debug &&
                task_config.debug.build?.dockerfile
              ? task_config.debug.build.dockerfile
              : task_config.build.dockerfile || 'Dockerfile',
            args: context.component.debug &&
                task_config.debug &&
                'build' in task_config.debug &&
                task_config.debug.build?.args
              ? (task_config.debug.build.args as Record<string, string>)
              : task_config.build.args || {},
          },
        });

        build_node.inputs = parseExpressionRefs(graph, context, build_node.getId(), build_node.inputs);
        graph.insertNodes(build_node);
        graph.insertEdges(
          new GraphEdge({
            from: cronjob_node_id,
            to: build_node.getId(),
          }),
        );

        image = `\${{ ${build_node.getId()}.image }}`;
      } else {
        image = task_config.image;
      }

      let environment: Record<string, string> | undefined;
      if (task_config.environment) {
        environment = {};
        Object.entries(task_config.environment).forEach(([key, value]) => {
          environment![key] = String(value);
        });
      }

      const cronjob_node = new AppGraphNode({
        name: task_name,
        type: 'cronjob',
        component: context.component.name,
        inputs: {
          schedule: task_config.schedule!,
          image: image,
          ...(task_config.platform ? { platform: task_config.platform } : {}),
          ...(task_config.command ? { command: task_config.command } : {}),
          ...(task_config.entrypoint ? { entrypoint: task_config.entrypoint } : {}),
          ...(environment ? { environment } : {}),
          ...(task_config.cpu ? { cpu: Number(task_config.cpu) } : {}),
          ...(task_config.memory ? { memory: task_config.memory } : {}),
          ...(task_config.labels ? { labels: task_config.labels } : {}),
          volume_mounts: Object.entries(task_config.volumes || {}).reduce(
            (mounts, [volume_name, volume_config]) => {
              const volume_node = new AppGraphNode({
                name: `${task_name}-${volume_name}`,
                type: 'volume',
                component: context.component.name,
                inputs: {
                  name: `${context.component.name}/${task_name}-${volume_name}`,
                  ...(volume_config.host_path ? { hostPath: volume_config.host_path } : {}),
                },
              });

              volume_node.inputs = parseExpressionRefs(graph, context, volume_node.getId(), volume_node.inputs);
              graph.insertNodes(volume_node);
              graph.insertEdges(
                new GraphEdge({
                  from: cronjob_node.getId(),
                  to: volume_node.getId(),
                }),
              );

              // Mount the volume to the deployment
              mounts = mounts || [];
              mounts.push({
                volume: `\${{ ${volume_node.getId()}.id }}`,
                mount_path: volume_config.mount_path!,
                readonly: volume_config.readonly ? Boolean(volume_config.readonly) : false,
              });
              return mounts;
            },
            [] as ResourceInputs['cronjob']['volume_mounts'],
          ),
        },
      });

      // Insert the deployment node
      cronjob_node.inputs = parseExpressionRefs(graph, context, cronjob_node.getId(), cronjob_node.inputs);
      graph.insertNodes(cronjob_node);
    }

    return graph;
  }

  private addInterfacesToGraph(
    graph: AppGraph,
    context: GraphContext,
  ): AppGraph {
    for (
      const [interface_key, interface_config] of Object.entries(
        this.interfaces || {},
      )
    ) {
      const regex_match = /\${{\s?services\.([\w-]+)\.interfaces\.([\w-]+)\.([\dA-Za-z]+)\s?}}/g.exec(
        typeof interface_config === 'string' ? interface_config : interface_config.url,
      );

      if (!regex_match) {
        throw new Error(`Invalid interface url`);
      }

      const [_, deployment_name, service_name] = regex_match;

      if (!this.services?.[deployment_name]?.interfaces?.[service_name]) {
        throw new Error('Invalid interface url');
      }

      const deployment_node_id = `${context.component.name.replaceAll('/', '--')}--${deployment_name}`;
      const target_interface = this.services![deployment_name].interfaces![service_name];

      const interface_node = new AppGraphNode<'service'>({
        name: interface_key,
        type: 'service',
        component: context.component.name,
        inputs: {
          protocol: typeof target_interface === 'object' && target_interface.protocol
            ? target_interface.protocol
            : 'http',
          port: typeof target_interface === 'object' ? target_interface.port : (target_interface as any),
          deployment: deployment_node_id,
        },
      });

      interface_node.inputs = parseExpressionRefs(graph, context, interface_node.getId(), interface_node.inputs);
      graph.insertNodes(interface_node);
      graph.insertEdges(
        new GraphEdge({
          from: interface_node.getId(),
          to: deployment_node_id,
        }),
      );

      if (typeof interface_config === 'object' && interface_config.ingress) {
        interface_node.inputs = parseExpressionRefs(graph, context, interface_node.getId(), interface_node.inputs);
        graph.insertNodes(interface_node);

        const ingress_node = new AppGraphNode({
          name: interface_key,
          type: 'ingress',
          component: context.component.name,
          inputs: {
            service: {
              name: `\${{ ${interface_node.getId()}.name }}`,
              host: `\${{ ${interface_node.getId()}.host }}`,
              port: `\${{ ${interface_node.getId()}.port }}`,
              protocol: `\${{ ${interface_node.getId()}.protocol }}`,
            },
            port: `\${{ ${interface_node.getId()}.port }}`,
            ...(interface_config.ingress.subdomain ? { subdomain: interface_config.ingress.subdomain } : {}),
            ...(interface_config.ingress.path ? { path: interface_config.ingress.path } : {}),
            ...(interface_config.ingress.internal !== undefined ? { internal: interface_config.ingress.internal } : {}),
            protocol: `\${{ ${interface_node.getId()}.protocol }}`,
            internal: false,
            path: '/',
          },
        });

        ingress_node.inputs = parseExpressionRefs(graph, context, ingress_node.getId(), ingress_node.inputs);
        graph.insertNodes(ingress_node);
        graph.insertEdges(
          new GraphEdge({
            from: ingress_node.getId(),
            to: interface_node.getId(),
          }),
        );
      }
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
        throw new Error(
          `Invalid database type. Must be of the format, <engine>:<version>`,
        );
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

  private addVariablesToGraph(graph: AppGraph, context: GraphContext): AppGraph {
    const values = {
      ...this.parameters,
      ...this.variables,
      ...this.secrets,
    };
    for (const [key, value] of Object.entries(values || {})) {
      const secret_node = new AppGraphNode({
        name: key,
        type: 'secret',
        component: context.component.name,
        inputs: {
          data: typeof value === 'string' ? value : value.default?.toString() || '',
          ...(typeof value === 'object'
            ? {
              ...(value.required ? { required: value.required } : {}),
              ...(value.merge ? { merge: value.merge } : {}),
            }
            : {}),
        },
      });

      graph.insertNodes(secret_node);
    }

    return graph;
  }

  public getGraph(context: GraphContext): AppGraph {
    let graph = new AppGraph();
    graph = this.addVariablesToGraph(graph, context);
    graph = this.addServicesToGraph(graph, context);
    graph = this.addTasksToGraph(graph, context);
    graph = this.addInterfacesToGraph(graph, context);
    graph = this.addDatabasesToGraph(graph, context);
    return graph;
  }

  public getDependencies(graph: AppGraph, context: GraphContext): ComponentDependencies {
    const res: ComponentDependencies = [];

    for (const [key, value] of Object.entries(this.dependencies || {})) {
      if (typeof value === 'string') {
        res.push({
          component: key,
        });
      } else {
        const inputs: ComponentDependencies[number]['inputs'] = {};
        for (const [inputKey, inputValue] of Object.entries(value.inputs || {})) {
          const from_id = `${value.component}/secret/${key}`;
          inputs[inputKey] = parseExpressionRefs(graph, context, from_id, inputValue);
        }

        res.push({
          component: value.component,
          inputs,
        });
      }
    }

    return res;
  }

  public async build(buildFn: DockerBuildFn, volumeBuildFn: VolumeBuildFn): Promise<Component> {
    for (const [svcName, svcConfig] of Object.entries(this.services || {})) {
      if ('build' in svcConfig) {
        const digest = await buildFn({
          name: svcName,
          context: svcConfig.build.context,
          dockerfile: svcConfig.build.dockerfile,
          args: svcConfig.build.args,
          target: svcConfig.build.target,
        });

        const rawSvc = svcConfig as any;
        rawSvc.image = digest;
        this.services![svcName] = rawSvc;
      }

      for (const [volumeName, volumeConfig] of Object.entries(svcConfig.volumes || {})) {
        if (volumeConfig.host_path) {
          volumeConfig.image = await volumeBuildFn({
            host_path: volumeConfig.host_path,
            volume_name: volumeName,
            deployment_name: svcName,
          });
        }
      }
    }

    for (const [taskName, taskConfig] of Object.entries(this.tasks || {})) {
      if ('build' in taskConfig) {
        const digest = await buildFn({
          name: taskName,
          context: taskConfig.build.context,
          dockerfile: taskConfig.build.dockerfile,
          args: taskConfig.build.args,
          target: taskConfig.build.target,
        });

        const rawSvc = taskConfig as any;
        rawSvc.image = digest;
        this.services![taskName] = rawSvc;
      }

      for (const [volumeName, volumeConfig] of Object.entries(taskConfig.volumes || {})) {
        if (volumeConfig.host_path) {
          volumeConfig.image = await volumeBuildFn({
            host_path: volumeConfig.host_path,
            volume_name: volumeName,
            deployment_name: taskName,
          });
        }
      }
    }

    return this;
  }

  public async tag(dockerTagFn: DockerTagFn, volumeTagFn: VolumeTagFn): Promise<Component> {
    for (const [svcName, svcConfig] of Object.entries(this.services || {})) {
      if ('image' in svcConfig) {
        svcConfig.image = await dockerTagFn(svcConfig.image, svcName);
        this.services![svcName] = svcConfig;
      }

      for (const [volumeName, volumeConfig] of Object.entries(svcConfig.volumes || {})) {
        if (volumeConfig.image) {
          svcConfig.volumes![volumeName].image = await volumeTagFn(volumeConfig.image, svcName, volumeName);
        }
      }
    }

    for (const [taskName, taskConfig] of Object.entries(this.tasks || {})) {
      if ('image' in taskConfig) {
        taskConfig.image = await dockerTagFn(taskConfig.image, taskName);
        this.tasks![taskName] = taskConfig;
      }

      for (const [volumeName, volumeConfig] of Object.entries(taskConfig.volumes || {})) {
        if (volumeConfig.image) {
          taskConfig.volumes![volumeName].image = await volumeTagFn(volumeConfig.image, taskName, volumeName);
        }
      }
    }

    return this;
  }

  public async push(pushFn: DockerPushFn): Promise<Component> {
    for (const svcConfig of Object.values(this.services || {})) {
      if ('build' in svcConfig && 'image' in svcConfig) {
        await pushFn(svcConfig.image);
      }

      for (const volumeConfig of Object.values(svcConfig.volumes || {})) {
        if (volumeConfig.image) {
          await pushFn(volumeConfig.image);
        }
      }
    }

    for (const taskConfig of Object.values(this.tasks || {})) {
      if ('build' in taskConfig && 'image' in taskConfig) {
        await pushFn(taskConfig.image);
      }
    }

    return this;
  }
}
