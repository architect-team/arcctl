import {
  InputSchema,
  ResourceInputs,
  ResourceType,
} from '../../@resources/index.ts';
import { CloudEdge, CloudGraph, CloudNode } from '../../cloud-graph/index.ts';
import { DeepPartial } from '../../utils/types.ts';
import { Datacenter } from '../datacenter.ts';
import { StateBackends } from './backends.ts';
import { LocalBackend, S3Backend } from 'cdktf';
import { Construct } from 'constructs';
import * as path from 'std/path/mod.ts';

/**
 * @discriminator type
 */
type FullResource = { provider: string } & InputSchema;

type Hook<T extends ResourceType = ResourceType> = {
  when?: { type: T } & DeepPartial<ResourceInputs[T]>;
  resources?: {
    [key: string]: FullResource;
  };
  modules?: {
    [key: string]: {
      source: string;
    } & Record<string, unknown>;
  };
} & DeepPartial<ResourceInputs[T]>;

export default class DatacenterV1 extends Datacenter {
  /**
   * Configure where terraform state files should be stored
   */
  state!: StateBackends;

  /**
   * Configure what resources must exist in each environment in the datacenter
   */
  resources?: {
    [key: string]: FullResource;
  };

  modules?: {
    [key: string]: {
      source: string;
    } & Record<string, unknown>;
  };

  /**
   * Configure rules for how application resources should behave in the environment
   */
  hooks?: Hook[];

  public constructor(data: Record<string, any>) {
    super();
    Object.assign(this, data);
  }

  private getNestedValue(input: any, keys: string[]): any {
    if (keys.length <= 0) {
      return input;
    } else {
      const key = keys.shift();

      if (!(key! in input)) {
        throw new Error(`${key} does not exist in ${JSON.stringify(input)}`);
      }

      return this.getNestedValue(input[key!], keys);
    }
  }

  private replaceEnvironmentResourceRefs<T>(
    graph: CloudGraph,
    environmentName: string,
    from_node_id: string,
    contents: T,
  ): T {
    return JSON.parse(
      JSON.stringify(contents).replace(
        /\${{\s?resources\.([\w-]+)\.(\S+)\s?}}/g,
        (full_ref, resource_id, resource_key) => {
          const resource = this.resources?.[resource_id];
          if (!resource) {
            throw new Error(`Invalid expression: ${full_ref}`);
          }

          const target_node_id = CloudNode.genId({
            type: resource.type,
            name: resource_id,
            environment: environmentName,
          });

          graph.insertEdges(
            new CloudEdge({
              from: from_node_id,
              to: target_node_id,
              required: true,
            }),
          );

          return `\${{ ${target_node_id}.${resource_key} }}`;
        },
      ),
    );
  }

  public async enrichGraph(
    graph: CloudGraph,
    environmentName: string,
  ): Promise<CloudGraph> {
    // Create nodes for explicit resources
    for (const [key, value] of Object.entries(this.resources || {})) {
      const node = new CloudNode({
        name: key,
        environment: environmentName,
        inputs: value,
      });

      node.inputs = this.replaceEnvironmentResourceRefs(
        graph,
        environmentName,
        node.id,
        node.inputs,
      );

      graph.insertNodes(node);
    }

    // Run hooks on each node
    for (const node of graph.nodes) {
      // Skip nodes that already have a provider
      if (node.account) continue;

      // See if the node matches any hooks
      for (const hook of this.hooks || []) {
        const doesMatchNode =
          !hook.when ||
          Object.entries(hook.when || {}).every(
            ([key, value]) =>
              key in node.inputs && (node.inputs as any)[key] === value,
          );

        if (!doesMatchNode) continue;

        const replaceHookExpressions = <T>(
          resources: { [key: string]: InputSchema },
          from_node_name: string,
          from_node_id: string,
          contents: T,
        ): T =>
          JSON.parse(
            JSON.stringify(contents)
              .replace(
                /\${{\s?this\.resources\.([\w-]+)\.(\S+)\s?}}/g,
                (full_ref, resource_id, resource_key) => {
                  const resource = resources?.[resource_id];
                  if (!resource) {
                    throw new Error(`Invalid expression: ${full_ref}`);
                  }

                  const target_node_id = CloudNode.genId({
                    type: resource.type,
                    name: `${from_node_name}/${resource_id}`,
                    environment: environmentName,
                    component: node.component,
                  });
                  graph.insertEdges(
                    new CloudEdge({
                      from: from_node_id,
                      to: target_node_id,
                      required: true,
                    }),
                  );

                  return `\${{ ${target_node_id}.${resource_key} }}`;
                },
              )
              .replace(/\${{\s?this\.(\S+)\s?}}/g, (_, node_key: string) =>
                this.getNestedValue(node, node_key.split('.')),
              ),
          );

        // Create inline resources defined by the hook
        for (const [resource_key, resource_config] of Object.entries(
          hook.resources || {},
        )) {
          const newResourceName = `${node.name}/${resource_key}`;

          const hook_node_id = CloudNode.genId({
            type: resource_config.type,
            name: newResourceName,
            component: node.component,
            environment: environmentName,
          });
          graph.insertNodes(
            new CloudNode({
              name: newResourceName,
              environment: environmentName,
              component: node.component,
              inputs: this.replaceEnvironmentResourceRefs(
                graph,
                environmentName,
                hook_node_id,
                replaceHookExpressions(
                  hook.resources || {},
                  newResourceName,
                  hook_node_id,
                  JSON.parse(
                    JSON.stringify(resource_config).replace(
                      /\${{\s?this\.outputs\.(\S+)\s?}}/g,
                      (_, key: string) => {
                        graph.insertEdges(
                          new CloudEdge({
                            from: hook_node_id,
                            to: node.id,
                            required: true,
                          }),
                        );

                        return `\${{ ${node.id}.${key} }}`;
                      },
                    ),
                  ),
                ),
              ),
            }),
          );
        }

        // Update
        const hookData = { ...hook };
        const hookResources = hookData.resources || {};
        delete hookData.when;
        delete hookData.resources;

        node.inputs = this.replaceEnvironmentResourceRefs(
          graph,
          environmentName,
          node.id,
          replaceHookExpressions(hookResources, node.name, node.id, {
            ...node.inputs,
            ...hookData,
            account: node.inputs.account || hookData.account,
          } as any),
        );

        graph.insertNodes(node);

        if (node.account) {
          break;
        }
      }
    }

    return graph;
  }

  configureBackend(scope: Construct, filename: string): void {
    switch (this.state.type) {
      case 'digitalocean': {
        new S3Backend(scope, {
          key: filename,
          bucket: this.state.bucket,
          accessKey: this.state.accessKey,
          secretKey: this.state.secretKey,
        });
        return;
      }
      case 'local': {
        new LocalBackend(scope, {
          path: path.join(this.state.path, filename),
        });
      }
    }
  }
}
