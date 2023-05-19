export type CloudEdgeOptions = {
  from: string;
  to: string;
  required: boolean;
};

export class CloudEdge {
  from: string;
  to: string;
  required: boolean;

  constructor(options: CloudEdgeOptions) {
    this.from = options.from;
    this.to = options.to;
    this.required = options.required;
  }

  get id(): string {
    return `${this.from}-${this.to}`;
  }
}
