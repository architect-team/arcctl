import { ResourceInputs } from '../../@resources/index.ts';
import { CloudEdge, CloudGraph, CloudNode } from '../../cloud-graph/index.ts';
import { Component, DockerBuildFn, DockerPushFn, DockerTagFn, GraphContext, VolumeBuildFn } from '../component.ts';
import { ComponentSchema } from '../schema.ts';
import { DatabaseSchemaV1 } from './database-schema-v1.ts';
import { parseExpressionRefs } from './expressions.ts';
import { InterfaceSchemaV1 } from './interface-schema-v1.ts';
import { ParameterSchemaV1 } from './parameter-schema-v1.ts';
import { DebuggableServiceSchemaV1 } from './service-schema-v1.ts';
import { DebuggableStaticBucketSchemaV1 } from './static-schema-v1.ts';
import { DebuggableTaskSchemaV1 } from './task-schema-v1.ts';

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
   */
  parameters?: Record<string, ParameterSchemaV1>;

  /**
   * A dictionary of named parameters that this component uses to configure services.
   *
   * Parameters can either be an object describing the parameter or a string shorthand that directly
   * applies to the `default` value.
   *
   * This is an alias for the `parameters` field.
   */
  secrets?: Record<string, ParameterSchemaV1>;

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
  dependencies?: Record<string, string>;

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
    graph: CloudGraph,
    context: GraphContext,
  ): CloudGraph {
    for (
      const [service_name, service_config] of Object.entries(
        this.services || {},
      )
    ) {
      // Generate the image build node as-needed
      let image = '';
      const deployment_node_id = CloudNode.genId({
        type: 'deployment',
        name: service_name,
        component: context.component.name,
        environment: context.environment,
      });

      if (!('image' in service_config)) {
        const build_node = new CloudNode({
          name: service_name,
          component: context.component.name,
          environment: context.environment,
          inputs: {
            type: 'dockerBuild',
            component_source: undefined as any,
            repository: context.component.name,
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

        graph.insertNodes(parseExpressionRefs(graph, context, build_node));
        graph.insertEdges(
          new CloudEdge({
            from: deployment_node_id,
            to: build_node.id,
            required: true,
          }),
        );

        image = `\${{ ${build_node.id}.image }}`;
      } else {
        image = service_config.image;
      }

      const deployment_node = new CloudNode({
        name: service_name,
        component: context.component.name,
        environment: context.environment,
        inputs: {
          type: 'deployment',
          name: CloudNode.genResourceId({
            name: service_name,
            component: context.component.name,
            environment: context.environment,
          }),
          replicas: Number(service_config.replicas || 1), // TODO: Ensure this is a number value
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
              const volume_node = new CloudNode({
                name: `${service_name}-${volume_name}`,
                component: context.component.name,
                environment: context.environment,
                inputs: {
                  type: 'volume',
                  mountPath: volume_config.mount_path,
                  ...(volume_config.host_path ? { hostPath: volume_config.host_path } : {}),
                },
              });

              graph.insertNodes(
                parseExpressionRefs(graph, context, volume_node),
              );
              graph.insertEdges(
                new CloudEdge({
                  from: deployment_node.id,
                  to: volume_node.id,
                  required: true,
                }),
              );

              // Mount the volume to the deployment
              mounts = mounts || [];
              mounts.push({
                volume: volume_node.resource_id,
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
      graph.insertNodes(parseExpressionRefs(graph, context, deployment_node));

      // Create and insert the service nodes for each interface
      for (
        const [interface_name, interface_config] of Object.entries(
          service_config.interfaces || {},
        )
      ) {
        const service_node = new CloudNode<'service'>({
          name: `${service_name}-${interface_name}`,
          component: context.component.name,
          environment: context.environment,
          inputs: {
            type: 'service',
            name: CloudNode.genResourceId({
              name: `${service_name}-${interface_name}`,
              component: context.component.name,
              environment: context.environment,
            }),
            protocol: typeof interface_config === 'object' && interface_config.protocol
              ? interface_config.protocol
              : 'http',
            selector: deployment_node.resource_id,
            target_port: Number(
              typeof interface_config === 'object' ? interface_config.port : interface_config,
            ),
          },
        });

        graph.insertNodes(parseExpressionRefs(graph, context, service_node));
        graph.insertEdges(
          new CloudEdge({
            from: service_node.id,
            to: deployment_node.id,
            required: false,
          }),
        );

        if (typeof interface_config === 'object' && interface_config.ingress) {
          graph.insertNodes(parseExpressionRefs(graph, context, service_node));

          const ingress_node = new CloudNode({
            name: `${service_name}-${interface_name}`,
            component: context.component.name,
            environment: context.environment,
            inputs: {
              type: 'ingressRule',
              loadBalancer: '',
              port: 80,
              listener: {
                subdomain: interface_config.ingress.subdomain || '',
                path: interface_config.ingress.path || '/',
                protocol: `\${{ ${service_node.id}.protocol }}`,
              },
              service: `\${{ ${service_node.id}.id }}`,
              internal: interface_config.ingress.internal || false,
            },
          });

          graph.insertNodes(parseExpressionRefs(graph, context, ingress_node));
          graph.insertEdges(
            new CloudEdge({
              from: ingress_node.id,
              to: service_node.id,
              required: true,
            }),
          );
        }
      }
    }

    return graph;
  }

  private addTasksToGraph(
    graph: CloudGraph,
    context: GraphContext,
  ): CloudGraph {
    for (
      const [task_name, task_config] of Object.entries(
        this.tasks || {},
      ).filter(([_, task_config]) => task_config.schedule)
    ) {
      // Generate the image build node as-needed
      let image = '';
      if (!('image' in task_config)) {
        const cronjob_node_id = CloudNode.genId({
          type: 'cronjob',
          name: task_name,
          component: context.component.name,
          environment: context.environment,
        });

        const build_node = new CloudNode({
          name: task_name,
          component: context.component.name,
          environment: context.environment,
          inputs: {
            type: 'dockerBuild',
            component_source: undefined as any,
            repository: context.component.name,
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

        graph.insertNodes(parseExpressionRefs(graph, context, build_node));
        graph.insertEdges(
          new CloudEdge({
            from: cronjob_node_id,
            to: build_node.id,
            required: true,
          }),
        );

        image = `\${{ ${build_node.id}.image }}`;
      } else {
        image = task_config.image;
      }

      const cronjob_node = new CloudNode({
        name: task_name,
        component: context.component.name,
        environment: context.environment,
        inputs: {
          type: 'cronjob',
          schedule: task_config.schedule!,
          image: image,
          ...(task_config.command ? { command: task_config.command } : {}),
          ...(task_config.entrypoint ? { entrypoint: task_config.entrypoint } : {}),
          ...(task_config.environment ? { environment: task_config.environment } : {}),
          ...(task_config.cpu ? { cpu: Number(task_config.cpu) } : {}),
          ...(task_config.memory ? { memory: task_config.memory } : {}),
          ...(task_config.labels ? { labels: task_config.labels } : {}),
          volume_mounts: Object.entries(task_config.volumes || {}).reduce(
            (mounts, [volume_name, volume_config]) => {
              const volume_node = new CloudNode({
                name: `${task_name}-${volume_name}`,
                component: context.component.name,
                environment: context.environment,
                inputs: {
                  type: 'volume',
                  mountPath: volume_config.mount_path,
                  ...(volume_config.host_path ? { hostPath: volume_config.host_path } : {}),
                },
              });

              graph.insertNodes(
                parseExpressionRefs(graph, context, volume_node),
              );
              graph.insertEdges(
                new CloudEdge({
                  from: cronjob_node.id,
                  to: volume_node.id,
                  required: true,
                }),
              );

              // Mount the volume to the deployment
              mounts = mounts || [];
              mounts.push({
                volume: `\${{ ${volume_node.id}.id }}`,
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
      graph.insertNodes(parseExpressionRefs(graph, context, cronjob_node));
    }

    return graph;
  }

  private addInterfacesToGraph(
    graph: CloudGraph,
    context: GraphContext,
  ): CloudGraph {
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

      const deployment_node_id = CloudNode.genId({
        type: 'deployment',
        name: deployment_name,
        component: context.component.name,
        environment: context.environment,
      });

      const deployment_resource_id = CloudNode.genResourceId({
        name: deployment_name,
        component: context.component.name,
        environment: context.environment,
      });

      const target_interface = this.services![deployment_name].interfaces![service_name];

      const interface_node = new CloudNode<'service'>({
        name: interface_key,
        component: context.component.name,
        environment: context.environment,
        inputs: {
          type: 'service',
          name: CloudNode.genResourceId({
            name: interface_key,
            component: context.component.name,
            environment: context.environment,
          }),
          protocol: typeof target_interface === 'object' && target_interface.protocol
            ? target_interface.protocol
            : 'http',
          target_port: typeof target_interface === 'object' ? target_interface.port : (target_interface as any),
          selector: deployment_resource_id,
        },
      });

      graph.insertNodes(parseExpressionRefs(graph, context, interface_node));
      graph.insertEdges(
        new CloudEdge({
          from: interface_node.id,
          to: deployment_node_id,
          required: false,
        }),
      );

      if (typeof interface_config === 'object' && interface_config.ingress) {
        graph.insertNodes(parseExpressionRefs(graph, context, interface_node));

        const ingress_node = new CloudNode({
          name: interface_key,
          component: context.component.name,
          environment: context.environment,
          inputs: {
            type: 'ingressRule',
            loadBalancer: '',
            service: `\${{ ${interface_node.id}.id }}`,
            port: 80,
            listener: {
              subdomain: interface_config.ingress.subdomain || '',
              path: interface_config.ingress.path || '/',
              protocol: `\${{ ${interface_node.id}.protocol }}`,
            },
            internal: interface_config.ingress.internal || false,
          },
        });

        graph.insertNodes(parseExpressionRefs(graph, context, ingress_node));
        graph.insertEdges(
          new CloudEdge({
            from: ingress_node.id,
            to: interface_node.id,
            required: true,
          }),
        );
      }
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
        throw new Error(
          `Invalid database type. Must be of the format, <engine>:<version>`,
        );
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

  public getGraph(context: GraphContext): CloudGraph {
    let graph = new CloudGraph();
    graph = this.addServicesToGraph(graph, context);
    graph = this.addTasksToGraph(graph, context);
    graph = this.addInterfacesToGraph(graph, context);
    graph = this.addDatabasesToGraph(graph, context);
    return graph;
  }

  public getDependencies(): string[] {
    return Object.keys(this.dependencies || {});
  }

  public async build(buildFn: DockerBuildFn, volumeBuildFn: VolumeBuildFn): Promise<Component> {
    for (const [svcName, svcConfig] of Object.entries(this.services || {})) {
      if ('build' in svcConfig) {
        const digest = await buildFn({
          context: svcConfig.build.context,
          dockerfile: svcConfig.build.dockerfile,
          args: svcConfig.build.args,
          target: svcConfig.build.target,
        });

        const rawSvc = svcConfig as any;
        rawSvc.image = digest;
        this.services![svcName] = rawSvc;
      }
    }

    for (const [taskName, taskConfig] of Object.entries(this.tasks || {})) {
      if ('build' in taskConfig) {
        const digest = await buildFn({
          context: taskConfig.build.context,
          dockerfile: taskConfig.build.dockerfile,
          args: taskConfig.build.args,
          target: taskConfig.build.target,
        });

        const rawSvc = taskConfig as any;
        rawSvc.image = digest;
        this.services![taskName] = rawSvc;
      }
    }

    return this;
  }

  public async tag(tagFn: DockerTagFn): Promise<Component> {
    for (const [svcName, svcConfig] of Object.entries(this.services || {})) {
      if ('build' in svcConfig && 'image' in svcConfig) {
        svcConfig.image = await tagFn(svcConfig.image, svcName);
        this.services![svcName] = svcConfig;
      }
    }

    for (const [taskName, taskConfig] of Object.entries(this.tasks || {})) {
      if ('build' in taskConfig && 'image' in taskConfig) {
        taskConfig.image = await tagFn(taskConfig.image, taskName);
        this.tasks![taskName] = taskConfig;
      }
    }

    return this;
  }

  public async push(pushFn: DockerPushFn): Promise<Component> {
    for (const svcConfig of Object.values(this.services || {})) {
      if ('build' in svcConfig && 'image' in svcConfig) {
        await pushFn(svcConfig.image);
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
