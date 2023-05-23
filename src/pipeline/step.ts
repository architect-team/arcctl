import { ResourceOutputs, ResourceType } from '../@resources/index.js';
import { CloudNode, CloudNodeOptions } from '../cloud-graph/index.js';
import { StepAction, NodeColor, StepStatus } from './types.js';

export type PipelineStepOptions<T extends ResourceType> =
  CloudNodeOptions<T> & {
    action: StepAction;
    color: NodeColor;
    status: StepStatus;
    datacenter: string;
    outputs?: ResourceOutputs[T];
  };

export class PipelineStep<
  T extends ResourceType = ResourceType,
> extends CloudNode<T> {
  action: StepAction;
  color: NodeColor;
  status: StepStatus;
  datacenter: string;
  outputs?: ResourceOutputs[T];

  constructor(options: PipelineStepOptions<T>) {
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
