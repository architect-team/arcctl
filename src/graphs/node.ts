export type GraphNodeOptions<I> = {
  name: string;
  inputs: I;
};

export abstract class GraphNode<I = any> {
  name: string;
  inputs: I;

  constructor(options: GraphNodeOptions<I>) {
    this.name = options.name;
    this.inputs = options.inputs;
  }

  abstract getId(): string;
}
