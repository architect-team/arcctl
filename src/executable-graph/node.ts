import { ResourceOutputs, ResourceType } from '../@resources/index.js';
import { CloudNode, CloudNodeOptions } from '../cloud-graph/index.js';
import { NodeAction, NodeColor, NodeStatus } from './types.js';

export type ExecutableNodeOptions<T extends ResourceType> =
  CloudNodeOptions<T> & {
    action: NodeAction;
    color: NodeColor;
    status: NodeStatus;
    datacenter: string;
    outputs?: ResourceOutputs[T];
  };

export class ExecutableNode<
  T extends ResourceType = ResourceType,
> extends CloudNode<T> {
  action: NodeAction;
  color: NodeColor;
  status: NodeStatus;
  datacenter: string;
  outputs?: ResourceOutputs[T];

  constructor(options: ExecutableNodeOptions<T>) {
    super(options);
    this.action = options.action;
    this.color = options.color;
    this.status = options.status;
    this.datacenter = options.datacenter;
    this.outputs = options.outputs;
  }

  get id(): string {
    return super.id + '-' + this.color;
  }

  get resource_id(): string {
    return super.resource_id + '-' + this.color;
  }
}
