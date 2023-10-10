import { AppGraph } from '../app/graph.ts';
import { GraphEdge } from '../edge.ts';
import { AppGraphOptions, Graph } from '../graph.ts';
import { InfraGraphNode } from './node.ts';

export enum PlanContext {
  Datacenter = 1,
  Environment = 2,
  Component = 3,
}

export type PlanOptions = {
  before: InfraGraph;
  after: AppGraph;
  context?: PlanContext;
  refresh?: boolean;
};

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

  public static async plan(options: PlanOptions): Promise<InfraGraph> {
    const newInfraGraph = new InfraGraph({
      edges: [...options.after.edges],
    });

    // Insert hashes and generate map of IDs to replace with color-coded IDs
    const replacements: Record<string, string> = {};
    for (const newNode of options.after.nodes) {
      const previousStep = options.before.nodes
        .find((n) => n.getId().startsWith(newNode.getId()));

      const oldId = newNode.id;
      if (
        !previousStep || (previousStep.status.state !== 'complete' && previousStep.action === 'create') ||
        previousStep.action === 'delete'
      ) {
        const newStep = new PipelineStep({
          ...newNode,
          type: newNode.type,
          color: 'blue',
          action: 'create',
          status: {
            state: 'pending',
          },
          state: previousStep?.state, // May exist if a create step error'd and was only partially applied
        });
        newStep.hash = await newStep.getHash(providerStore);
        pipeline.insertSteps(newStep);
        replacements[oldId] = newStep.id;
      } else {
        const newExecutable = new PipelineStep({
          ...newNode,
          type: newNode.type,
          color: previousStep.color,
          state: previousStep.state,
          action: 'update',
          status: {
            state: 'pending',
          },
        });
        newExecutable.hash = await newExecutable.getHash(providerStore);
        pipeline.insertSteps(newExecutable);
        replacements[oldId] = newExecutable.id;
      }
    }
  }
}
