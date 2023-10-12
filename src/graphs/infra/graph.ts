import { Observable } from 'rxjs';
import { applyContextRecursive } from '../../datacenter-ast/index.ts';
import { GraphEdge } from '../edge.ts';
import { AppGraphOptions, Graph } from '../graph.ts';
import { InfraGraphNode } from './node.ts';
import { ApplyOptions, PlanOptions } from './types.ts';

export class InfraGraph extends Graph<InfraGraphNode> {
  constructor(options?: AppGraphOptions<InfraGraphNode>) {
    // We re-initialize the nodes and edges in case we had previously
    // serialized the object as JSON
    super({
      nodes: options?.nodes?.map((node: any) => new InfraGraphNode(node)),
      edges: options?.edges?.map((edge: any) => new GraphEdge(edge)),
    });
  }

  /**
   * Update expressions that point to sourceId to point to targetId instead
   */
  private replaceNodeRefs(sourceId: string, targetId: string): void {
    // Replace expressions within nodes
    this.nodes = this.nodes.map((node) =>
      new InfraGraphNode(JSON.parse(
        JSON.stringify(node).replace(
          new RegExp('\\${{\\s?' + sourceId + '\\.(\\S+)\\s?}}', 'g'),
          (_, key) => `\${{ ${targetId}.${key} }}`,
        ),
      ))
    );

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

  /**
   * Resolves functions and input references using the AST parsers apply context,
   * with the context being all previously completed nodes' outputs.
   * Throws an error if an input key is unable to be substituted.
   */
  public resolveInputFunctionsAndRefs(node: InfraGraphNode) {
    const completedNodesWithOutputs = this.nodes.filter((node) =>
      node.outputs !== undefined && node.status.state === 'complete'
    );

    const context = completedNodesWithOutputs.reduce((context, node) => {
      context[node.name] = node.outputs;
      return context;
    }, {} as Record<string, unknown>);

    const notFound = applyContextRecursive(node.inputs, context);
    if (notFound.length > 0) {
      throw Error(`Missing outputs for key${notFound.length > 1 ? 's' : ''}: ${notFound.join(', ')}`);
    }
  }

  /**
   * Get the queue of nodes ready to be applied based on dependencies and node statuses
   */
  public getQueue(): InfraGraphNode[] {
    const completedNodeIds = this.nodes
      .filter((n) => n.status.state === 'complete').map((n) => n.getId());

    return this.nodes
      .sort(
        (first, second) =>
          (first.environment || '').localeCompare(second.environment || '') ||
          (first.component || '').localeCompare(second.component || '') ||
          0,
      )
      .filter((node) => {
        const hasIncompleteDeps = this.edges
          .some((edge) => {
            return edge.from === node.getId() && !completedNodeIds.includes(edge.to);
          });

        return node.status.state !== 'complete' && !hasIncompleteDeps;
      });
  }

  /**
   * Returns a new pipeline by comparing the old pipeline to a new target graph
   */
  public static async plan(options: PlanOptions): Promise<InfraGraph> {
    const newInfraGraph = new InfraGraph({
      edges: [...options.after.edges],
    });

    // Insert hashes and generate map of IDs to replace with color-coded IDs
    const replacements: Record<string, string> = {};
    for (const newNode of options.after.nodes) {
      const previousNode = options.before.nodes
        .find((n) => n.getId().startsWith(newNode.getId()));

      const oldId = newNode.getId();
      const newInfraNode = new InfraGraphNode({
        ...newNode,
        status: { state: 'pending' },
        state: previousNode?.state,
      });
      if (
        !previousNode || (previousNode.status.state !== 'complete' && previousNode.action === 'create') ||
        previousNode.action === 'delete'
      ) {
        newInfraNode.action = 'create';
        newInfraNode.color = 'blue';
      } else {
        newInfraNode.action = 'update';
        newInfraNode.color = previousNode.color;
      }

      newInfraGraph.insertNodes(newInfraNode);
      replacements[oldId] = newInfraNode.getId();
    }

    // Replace references with color-coded refs
    for (const [source, target] of Object.entries(replacements)) {
      newInfraGraph.replaceNodeRefs(source, target);
    }

    const potentialEdges: GraphEdge[] = [];
    for (const previousNode of options.before.nodes) {
      if (
        (previousNode.action === 'delete' &&
          previousNode.status.state === 'complete') ||
        (previousNode.action === 'create' && previousNode.status.state === 'pending')
      ) {
        continue;
      }

      const newNode = options.after.nodes.find((n) => previousNode.getId().startsWith(n.getId()));
      if (!newNode) {
        const deleteNode = new InfraGraphNode({
          ...previousNode,
          action: 'delete',
          status: {
            state: 'pending',
          },
        });

        newInfraGraph.insertNodes(deleteNode);
        const previousStepEdges = options.before.edges.filter((edge) => edge.to === deleteNode.getId());
        if (previousNode.action !== 'delete') {
          // If the previous pipeline was create or update, we need to flip the edge
          // so we delete dependencies in the right order.
          for (const oldEdge of previousStepEdges) {
            potentialEdges.push(oldEdge.reverse());
          }
        } else {
          // If the previous pipeline was delete, the edges are already correct and have been flipped.
          // We just need to remove any edges from the previous pipeline that may have had their nodes
          // deleted.
          for (const oldEdge of previousStepEdges) {
            // If there's no step for the oldEdge.from, the node's already removed so we can axe the edge.
            if (newInfraGraph.nodes.some((node) => node.getId() === oldEdge.from)) {
              potentialEdges.push(oldEdge);
            }
          }
        }
      }
    }

    // Add edges for nodes being removed that are still valid
    for (const potentialEdge of potentialEdges) {
      const targetNode = newInfraGraph.nodes.find((node) => node.getId() === potentialEdge.to);
      if (targetNode) {
        newInfraGraph.insertEdges(potentialEdge);
      }
    }

    // Set no-op steps for nodes that exist in the new graph + previous graph
    // and have an unchanged hash (module and inputs match)
    for (const node of newInfraGraph.nodes.filter((node) => node.action === 'update')) {
      const previousCompleteNode = options.before.nodes.find((node) =>
        node.status.state === 'complete' && node.getId().startsWith(node.getId())
      );

      if (!previousCompleteNode) {
        continue;
      }

      if ((await previousCompleteNode.getHash()) === (await node.getHash())) {
        node.action = 'no-op';
        node.status.state = 'complete';
        node.state = previousCompleteNode?.state;
        node.outputs = previousCompleteNode?.outputs;
      }
    }

    return newInfraGraph;
  }

  /**
   * Kick off the pipeline
   */
  public apply(options: ApplyOptions): Observable<InfraGraph> {
    const cwd = options.cwd || Deno.makeTempDirSync({ prefix: 'arcctl-' });

    return new Observable((subscriber) => {
      (async () => {
        for (const node of this.getQueue()) {
          if (node.inputs) {
            try {
              if (node.action !== 'delete') {
                this.resolveInputFunctionsAndRefs(node);
              }
            } catch (err: any) {
              node.status.state = 'error';
              node.status.message = err.message;
              subscriber.error(err.message);
              return;
            }
          }

          await new Promise<void>((resolve, reject) => {
            node
              .apply({
                ...options,
                cwd,
              })
              .subscribe({
                // TODO: Is this needed? No longer modifying plan while it's running
                // next: (res) => {
                //   this.insertSteps(res);
                // },
                error: (err: any) => {
                  reject(err);
                  return;
                },
                complete: () => {
                  resolve();
                  return;
                },
              });
          });
          subscriber.next(this);
        }
      })().then(() => {
        for (const node of this.nodes) {
          if (node.status.state !== 'complete') {
            throw Error(`InfraGraph pipeline finished with an unfinished step`);
          }
        }
        subscriber.complete();
      }).catch((err) => {
        subscriber.error(err);
      });
    });
  }
}
