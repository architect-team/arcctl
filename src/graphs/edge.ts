export type GraphEdgeOptions = {
  from: string;
  to: string;
};

export class GraphEdge {
  from: string;
  to: string;

  constructor(options: GraphEdgeOptions) {
    this.from = options.from;
    this.to = options.to;
  }

  get id(): string {
    return `${this.from}-${this.to}`;
  }

  reverse(): GraphEdge {
    return new GraphEdge({
      from: this.to,
      to: this.from,
    });
  }
}
