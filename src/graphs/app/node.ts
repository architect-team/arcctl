import { ResourceInputs, ResourceType } from '../../@resources/index.ts';
import { GraphNode, GraphNodeOptions } from '../node.ts';

export type AppGraphNodeOptions<T extends ResourceType = ResourceType> = GraphNodeOptions<ResourceInputs[T]> & {
  type: T;
  component: string;
};

export class AppGraphNode<T extends ResourceType = ResourceType> extends GraphNode<ResourceInputs[T]> {
  type: T;
  component: string;

  constructor(options: AppGraphNodeOptions<T>) {
    super(options);
    this.type = options.type;
    this.component = options.component;
  }

  getId(): string {
    return [this.component, this.type, this.name].join('/');
  }
}
