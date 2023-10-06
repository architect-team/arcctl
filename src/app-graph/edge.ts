export type CloudEdgeOptions = {
  from: string;
  to: string;
};

export class AppEdge {
  from: string;
  to: string;

  constructor(options: CloudEdgeOptions) {
    this.from = options.from;
    this.to = options.to;
  }

  get id(): string {
    return `${this.from}-${this.to}`;
  }

  /**
   * Returns a CloudEdge that points in the opposite direction as this edge.
   */
  reverse(): AppEdge {
    return new AppEdge({
      from: this.to,
      to: this.from,
    });
  }
}
