import { ResourceInputs, ResourceType } from '../../@resources/index.ts';
import { GraphNode, GraphNodeOptions } from '../node.ts';

export type AppGraphNodeOptions<T extends ResourceType = ResourceType> = GraphNodeOptions<ResourceInputs[T]> & {
  type: T;
};

export class AppGraphNode<T extends ResourceType = ResourceType> extends GraphNode<ResourceInputs[T]> {
  type: T;

  constructor(options: AppGraphNodeOptions<T>) {
    super(options);
    this.type = options.type;
  }

  getId(): string {
    return GraphNode.genResourceId({
      name: `${this.type}/${this.name}`,
      component: this.component,
      environment: this.environment,
    });
  }
}
