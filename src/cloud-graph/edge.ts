export type CloudEdgeOptions = {
  from: string;
  to: string;
};

export class CloudEdge {
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
  reverse(): CloudEdge {
    return new CloudEdge({
      from: this.to,
      to: this.from,
    });
  }
}
