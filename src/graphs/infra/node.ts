import { Observable } from 'rxjs';
import { Logger } from 'winston';
import { ResourceInputs, ResourceOutputs, ResourceType } from '../../@resources/index.ts';
import { GraphNode, GraphNodeOptions } from '../node.ts';

type NodeAction = 'no-op' | 'apply' | 'destroy';

type NodeColor = 'blue' | 'green';

type NodeStatus = {
  state: 'pending' | 'starting' | 'applying' | 'destroying' | 'complete' | 'unknown' | 'error';
  message?: string;
  startTime?: number;
  endTime?: number;
}

export type InfraGraphNodeOptions<T extends ResourceType = ResourceType> = GraphNodeOptions<ResourceInputs[T]> & {
  type: T;
  action: NodeAction;
  color?: NodeColor;
  status?: NodeStatus;
  outputs?: ResourceOutputs[T];
  state?: any;
};

export class InfraGraphNode<T extends ResourceType = ResourceType> extends GraphNode<ResourceInputs[T]> {
  type: T;
  action: NodeAction;
  color: NodeColor;
  status: NodeStatus;
  outputs?: ResourceOutputs[T];
  state?: any;

  constructor(options: InfraGraphNodeOptions<T>) {
    super(options);
    this.type = options.type;
    this.action = options.action;
    this.color = options.color || 'blue';
    this.outputs = options.outputs;
    this.state = options.state;
    this.status = options.status || { state: 'pending' };
  }

  getId(): string {
    return GraphNode.genResourceId({
      name: `${this.type}/${this.name}`,
      component: this.component,
      environment: this.environment,
    }) + '-' + this.color;
  }

  equals(node: InfraGraphNode): boolean {
    return this.name === node.name && this.type === node.type &&
      this.color === node.color && this.component === node.component &&
      this.environment === node.environment &&
      JSON.stringify(this.inputs) === JSON.stringify(node.inputs);
  }

  apply(options?: { cwd?: string; logger?: Logger }): Observable<InfraGraphNode<T>> {
    if (this.status.state !== 'pending') {
      throw new Error(`Cannot apply node in state, ${this.status.state}`);
    }

    return new Observable((subscriber) => {
      this.status.state = this.action === 'destroy' ? 'destroying' : 'applying';
    });
  }
}
