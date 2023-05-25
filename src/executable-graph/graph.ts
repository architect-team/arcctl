import { ProviderStore } from '../@providers/index.ts';
import { CloudEdge, CloudGraph } from '../cloud-graph/index.ts';
import { Datacenter } from '../datacenters/index.ts';
import { Terraform } from '../terraform/terraform.ts';
import CloudCtlConfig from '../utils/config.ts';
import { DatacenterStore } from '../utils/datacenter-store.ts';
import { CldCtlTerraformStack } from '../utils/stack.ts';
import { ExecutableNode } from './node.ts';
import { App } from 'cdktf';
import { Observable } from 'rxjs';
import * as path from 'std/path/mod.ts';
import { Logger } from 'winston';
import { Construct } from 'constructs';

export type ExecutableGraphOptions = {
  before: ExecutableGraph;
  after: CloudGraph;
  datacenter: Datacenter;
  cwd?: string;
};

export type PlanOptions = {
  before: ExecutableGraph;
  after: CloudGraph;
  datacenter: string;
};

export type ApplyOptions = {
  datacenterStore: DatacenterStore;
  providerStore: ProviderStore;
  cwd?: string;
  logger?: Logger;
};

export class ExecutableGraph extends CloudGraph {
  private _terraform?: Terraform;

  /**
   * @override
   */
  declare nodes: ExecutableNode[];

  public static plan(options: PlanOptions): ExecutableGraph {
    const graph = new ExecutableGraph({
      edges: [...options.after.edges],
    });

    const replacements: Record<string, string> = {};
    for (const newNode of options.after.nodes) {
      const oldNode = options.before.nodes.find((n) =>
        n.id.startsWith(newNode.id),
      );

      const oldId = newNode.id;
      if (!oldNode) {
        const newExecutable = new ExecutableNode({
          ...newNode,
          color: 'blue',
          datacenter: options.datacenter,
          action: 'create',
          status: {
            state: 'pending',
          },
        });
        graph.insertNodes(newExecutable);
        replacements[oldId] = newExecutable.id;
      } else {
        const newExecutable = new ExecutableNode({
          ...newNode,
          datacenter: options.datacenter,
          color: oldNode.color,
          action: 'update',
          status: {
            state: 'pending',
          },
        });
        graph.insertNodes(newExecutable);
        replacements[oldId] = newExecutable.id;
      }
    }

    for (const [source, target] of Object.entries(replacements)) {
      graph.replaceNodeRefs(source, target);
    }

    // Check for nodes that should be removed
    for (const oldNode of options.before.nodes) {
      if (oldNode.action === 'delete' && oldNode.status.state !== 'error') {
        continue;
      }

      const newNode = options.after.nodes.find((n) =>
        oldNode.id.startsWith(n.id),
      );
      if (!newNode) {
        const rmNode = new ExecutableNode({
          ...oldNode,
          action: 'delete',
          status: {
            state: 'pending',
          },
        });

        graph.insertNodes(rmNode);

        for (const oldEdge of options.before.edges) {
          if (oldEdge.to === rmNode.id) {
            graph.insertEdges(
              new CloudEdge({
                from: oldEdge.to,
                to: oldEdge.from,
                required: oldEdge.required,
              }),
            );
          }
        }
      }
    }

    return graph;
  }

  private async getTerraformPlugin(): Promise<Terraform> {
    if (this._terraform) {
      return this._terraform;
    }

    this._terraform = await Terraform.generate(
      CloudCtlConfig.getPluginDirectory(),
      '1.4.5',
    );

    return this._terraform;
  }

  public replaceNodeRefs(sourceId: string, targetId: string): void {
    // Replace expressions within nodes
    this.nodes = this.nodes.map((node) => {
      return new ExecutableNode(
        JSON.parse(
          JSON.stringify(node).replace(
            new RegExp('\\${{\\s?' + sourceId + '\\.(\\S+)\\s?}}', 'g'),
            (_, key) => `\${{ ${targetId}.${key} }}`,
          ),
        ),
      );
    });

    // Replace edge sources and targets
    this.edges = this.edges.map((edge) => {
      if (edge.from === sourceId) {
        edge.from = targetId;
      } else if (edge.to === sourceId) {
        edge.to = targetId;
      }

      return edge;
    });
  }

  private replaceRefsWithOutputValues<T>(input: T): T {
    return JSON.parse(
      JSON.stringify(input).replace(
        /\${{\s?([^.]+).(\S+)\s?}}/g,
        (_, node_id, key) => {
          const node = this.nodes.find((n) => n.id === node_id);
          if (!node || !node.outputs) {
            throw new Error(`Missing outputs for ${node_id}`);
          } else if (!(node.outputs as any)[key]) {
            throw new Error(`Invalid key, ${key}, for ${node.type}`);
          }

          return (node.outputs as any)[key];
        },
      ),
    );
  }

  private getNextNode(...seenIds: string[]): ExecutableNode | undefined {
    const availableNodes = this.nodes.filter((node) => {
      const isNodeSeen = seenIds.includes(node.id);
      const hasDeps = this.edges.some(
        (edge) =>
          edge.required && edge.from === node.id && !seenIds.includes(edge.to),
      );

      return !isNodeSeen && !hasDeps;
    });

    return availableNodes.shift();
  }

  private applyNode<T extends ExecutableNode>(
    node: T,
    options: ApplyOptions,
  ): Observable<T> {
    const cwd = options.cwd || Deno.makeTempDirSync({ prefix: 'cldctl-' });

    return new Observable((subscriber) => {
      const nodeDir = path.join(cwd, node.id.replaceAll('/', '--'));
      Deno.mkdirSync(nodeDir, { recursive: true });
      if (!nodeDir) {
        subscriber.error(
          new Error('Unable to create execution directory for terraform'),
        );
        return;
      }

      const app = new App();
      const stack = new CldCtlTerraformStack(app, node.id);

      options.datacenterStore
        .getDatacenter(node.datacenter)
        .then((datacenter) => {
          if (!datacenter) {
            subscriber.error(
              new Error(`No datacenter named ${node.datacenter}`),
            );
            return;
          }

          // TODO(tyler): Type error
          datacenter.config.configureBackend(
            stack as unknown as Construct,
            `${node.id}.tfstate`,
          );

          node.inputs = this.replaceRefsWithOutputValues(node.inputs);
          subscriber.next(node);

          const provider = options.providerStore.getProvider(
            node.account || '',
          );
          if (!provider) {
            subscriber.error(new Error(`Invalid provider: ${node.account}`));
            return;
          }

          const service = provider.resources[node.type];
          if (!service) {
            subscriber.error(
              new Error(
                `The ${provider.type} provider doesn't support the ${node.type} resource`,
              ),
            );
            return;
          }

          const ModuleConstructor = service.manage?.module;
          if (!ModuleConstructor) {
            subscriber.error(
              new Error(
                `The ${provider.type} provider can't create ${node.type} resources`,
              ),
            );
            return;
          }

          provider.configureTerraformProviders(stack as unknown as Construct);
          const { module, output: tfOutput } = stack.addModule(
            ModuleConstructor as any,
            node.resource_id,
            node.inputs,
          );

          node.status.state = 'starting';
          node.status.message = 'Initializing terraform';
          node.status.startTime = Date.now();
          subscriber.next(node);

          this.getTerraformPlugin().then(async (terraform) => {
            const initCmd = terraform.init(nodeDir, stack);
            if (options.logger) {
              initCmd.stdout?.on('data', (chunk) => {
                options.logger?.info(chunk);
              });
              initCmd.stderr?.on('data', (chunk) => {
                options.logger?.error(chunk);
              });
            }
            await initCmd;

            node.status.state = 'starting';
            node.status.message = 'Generating diff';
            subscriber.next(node);

            const planCmd = terraform.plan(nodeDir, 'plan', {
              destroy: node.action === 'delete',
            });
            if (options.logger) {
              planCmd.stdout?.on('data', (chunk) => {
                options.logger?.info(chunk);
              });
              planCmd.stderr?.on('data', (chunk) => {
                options.logger?.error(chunk);
              });
            }
            await planCmd;

            node.status.state = 'applying';
            node.status.message = 'Applying changes';
            subscriber.next(node);

            const applyCmd = terraform.apply(nodeDir, 'plan');
            if (options.logger) {
              applyCmd.stdout?.on('data', (chunk) => {
                options.logger?.info(chunk);
              });
              applyCmd.stderr?.on('data', (chunk) => {
                options.logger?.error(chunk);
              });
            }
            await applyCmd;

            node.status.state = 'applying';
            node.status.message = 'Collecting outputs';
            subscriber.next(node);

            let parsedOutputs: any;
            if (node.action !== 'delete') {
              const { stdout: rawOutputs } = await terraform.output(nodeDir);
              parsedOutputs = JSON.parse(rawOutputs);
              node.outputs = parsedOutputs[tfOutput.friendlyUniqueId].value;
            }

            node.status.state = 'applying';
            node.status.message = 'Running hooks';
            subscriber.next(node);

            if (node.action !== 'delete' && module.hooks.afterCreate) {
              try {
                await module.hooks.afterCreate(
                  options.providerStore.saveFile.bind(options.providerStore),
                  options.providerStore.saveProvider.bind(
                    options.providerStore,
                  ),
                  (id: string) => {
                    if (node.action !== 'delete') {
                      if (parsedOutputs[id]) {
                        return parsedOutputs[id].value;
                      }

                      throw new Error(`Invalid output key, ${id}`);
                    }
                  },
                );
              } catch (err) {
                subscriber.error(err);
                return;
              }
            } else if (node.action === 'delete' && module.hooks.afterDelete) {
              try {
                await module.hooks.afterDelete();
              } catch (err) {
                subscriber.error(err);
                return;
              }
            }

            node.status.state = 'complete';
            node.status.message = '';
            node.status.endTime = Date.now();
            subscriber.next(node);
            subscriber.complete();
          });
        })
        .catch((err) => subscriber.error(err));
    });
  }

  public async apply(options: ApplyOptions): Promise<void> {
    const cwd = options.cwd || Deno.makeTempDirSync({ prefix: 'cldctl-' });

    let node: ExecutableNode | undefined;
    while (
      (node = this.getNextNode(
        ...this.nodes
          .filter(
            (n) => n.status.state === 'complete' || n.status.state === 'error',
          )
          .map((n) => n.id),
      ))
    ) {
      if (!node) {
        throw new Error(`Something went wrong queuing up a node to apply`);
      }

      await new Promise<void>((resolve, reject) => {
        this.applyNode(node!, {
          ...options,
          cwd,
        }).subscribe({
          next: (node) => {
            this.insertNodes(node);
          },
          error: reject,
          complete: resolve,
        });
      });
    }
  }
}
