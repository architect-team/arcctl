import { CloudEdge } from './edge.ts';
import { CloudNode } from './node.ts';

export type CloudGraphOptions = {
  nodes?: CloudNode[];
  edges?: CloudEdge[];
};

export class CloudGraph {
  nodes: CloudNode[];
  edges: CloudEdge[];

  constructor(options?: CloudGraphOptions) {
    this.nodes = options?.nodes || [];
    this.edges = options?.edges || [];
  }

  public insertNodes(...args: CloudNode[]): CloudGraph {
    for (const node of args) {
      const index = this.nodes.findIndex((item) => item.id === node.id);
      if (index >= 0) {
        this.nodes[index] = node;
      } else {
        this.nodes.push(node);
      }
    }

    return this;
  }

  public insertEdges(...args: CloudEdge[]): CloudGraph {
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

  public removeNode(id: string): CloudGraph {
    for (const index in this.nodes) {
      if (this.nodes[index].id === id) {
        this.nodes.splice(Number(index), 1);
        return this;
      }
    }

    throw new Error(`Node with id ${id} not found`);
  }

  public removeEdge(options: { from?: string; to?: string }): CloudGraph {
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
    for (const node of this.nodes) {
      if (!node.account) {
        throw new Error(`Missing account for node: ${node.id}`);
      }
      if (node.type === 'secret') {
        const secret_node = node as CloudNode<'secret'>;
        if (secret_node.inputs.required && !secret_node.inputs.data) {
          throw new Error(`Missing required value for secret: ${node.id}`);
        }
      }
    }

    for (const edge of this.edges) {
      if (!this.nodes.some((n) => n.id === edge.from)) {
        throw new Error(`${edge.from} is missing from the graph`);
      } else if (!this.nodes.some((n) => n.id === edge.to)) {
        console.log(this.edges);
        throw new Error(`${edge.to} is missing from the graph, but required by ${edge.from}`);
      }
    }
  }

  public getDependencies(node_id: string): CloudNode[] {
    return this.nodes.filter(
      (node) => node.id !== node_id && this.edges.some((edge) => edge.from === node_id && edge.to === node.id),
    );
  }

  public getDependents(node_id: string): CloudNode[] {
    return this.nodes.filter(
      (node) => node.id !== node_id && this.edges.some((edge) => edge.to === node_id && edge.from === node.id),
    );
  }

  public toJSON(): { nodes: CloudNode[]; edges: CloudEdge[] } {
    return {
      nodes: this.nodes,
      edges: this.edges,
    };
  }
}
