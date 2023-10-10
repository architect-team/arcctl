import { GraphEdge } from './edge.ts';
import { GraphNode } from './node.ts';

export type AppGraphOptions<N extends GraphNode = GraphNode, E extends GraphEdge = GraphEdge> = {
  nodes?: N[];
  edges?: E[];
};

export abstract class Graph<N extends GraphNode, E extends GraphEdge = GraphEdge> {
  nodes: N[];
  edges: E[];

  constructor(options?: AppGraphOptions<N, E>) {
    this.nodes = options?.nodes || [];
    this.edges = options?.edges || [];
  }

  public insertNodes(...args: N[]): Graph<N, E> {
    for (const node of args) {
      const index = this.nodes.findIndex((item) => item.getId() === node.getId());
      if (index >= 0) {
        this.nodes[index] = node;
      } else {
        this.nodes.push(node);
      }
    }

    return this;
  }

  public insertEdges(...args: E[]): Graph<N, E> {
    for (const edge of args) {
      const index = this.edges.findIndex((item) => item.id === edge.id);
      const isCircular = edge.from === edge.to;
      if (isCircular) {
        continue;
      }
      if (index >= 0) {
        this.edges[index] = edge;
      } else {
        this.edges.push(edge);
      }
    }

    return this;
  }

  public removeNode(id: string): Graph<N, E> {
    for (const index in this.nodes) {
      if (this.nodes[index].getId() === id) {
        this.nodes.splice(Number(index), 1);
        return this;
      }
    }

    throw new Error(`Node with id ${id} not found`);
  }

  public removeEdge(options: { from?: string; to?: string }): Graph<N, E> {
    if (!options.from && !options.to) {
      throw new Error('Must specify at least one of: from, to');
    }

    for (const index in this.edges) {
      if (
        (options.from &&
          options.to &&
          this.edges[index].from === options.from &&
          this.edges[index].to === options.to) ||
        (options.from && !options.to && this.edges[index].from === options.from) ||
        (options.to && !options.from && this.edges[index].to === options.to)
      ) {
        this.edges.splice(Number(index), 1);
        return this;
      }
    }

    throw new Error(`No edge found matching options: ${JSON.stringify(options)}`);
  }

  public validate(): void {
    for (const edge of this.edges) {
      if (!this.nodes.some((n) => n.getId() === edge.from)) {
        throw new Error(`${edge.from} is missing from the graph`);
      } else if (!this.nodes.some((n) => n.getId() === edge.to)) {
        throw new Error(`${edge.to} is missing from the graph, but required by ${edge.from}`);
      }
    }
  }

  public getDependencies(node_id: string): N[] {
    return this.nodes.filter(
      (node) =>
        node.getId() !== node_id && this.edges.some((edge) => edge.from === node_id && edge.to === node.getId()),
    );
  }

  public getDependents(node_id: string): N[] {
    return this.nodes.filter(
      (node) =>
        node.getId() !== node_id && this.edges.some((edge) => edge.to === node_id && edge.from === node.getId()),
    );
  }

  public toJSON(): { nodes: N[]; edges: E[] } {
    return {
      nodes: this.nodes,
      edges: this.edges,
    };
  }
}
