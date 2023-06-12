import { Observable } from 'rxjs';
import * as path from 'std/path/mod.ts';
import { ApplyOutputs, ResourceService, WritableResourceService } from '../@providers/index.ts';
import { ResourceInputs, ResourceOutputs, ResourceType } from '../@resources/index.ts';
import { CloudNode } from '../cloud-graph/index.ts';
import { ApplyOptions, StepAction, StepColor, StepStatus } from './types.ts';

export type PipelineStepOptions<T extends ResourceType> = {
  name: string;
  type: T;
  action: StepAction;
  color?: StepColor;
  status?: StepStatus;
  component?: string;
  environment?: string;
  state?: any;
  inputs?: ResourceInputs[T];
  outputs?: ResourceOutputs[T];
};

export class PipelineStep<T extends ResourceType = ResourceType> {
  name: string;
  type: T;
  action: StepAction;
  color: StepColor;
  status: StepStatus;
  component?: string;
  environment?: string;
  state?: any;
  inputs?: ResourceInputs[T];
  outputs?: ResourceOutputs[T];

  constructor(options: PipelineStepOptions<T>) {
    this.name = options.name;
    this.type = options.type;
    this.action = options.action;
    this.color = options.color || 'blue';
    this.status = options.status || {
      state: 'pending',
    };
    this.component = options.component;
    this.environment = options.environment;
    this.state = options.state;
    this.inputs = options.inputs;
    this.outputs = options.outputs;
  }

  get id(): string {
    return CloudNode.genId(this) + '-' + this.color;
  }

  get resource_id(): string {
    return CloudNode.genResourceId(this) + '-' + this.color;
  }

  public equals(step: PipelineStep): boolean {
    return this.name === step.name && this.type === step.type &&
      this.color === step.color && this.component === step.component && this.environment === step.environment &&
      JSON.stringify(this.inputs) === JSON.stringify(step.inputs);
  }

  public apply(options: ApplyOptions): Observable<PipelineStep<T>> {
    const cwd = options.cwd || Deno.makeTempDirSync({ prefix: 'arcctl-' });

    return new Observable((subscriber) => {
      if (this.action === 'no-op') {
        subscriber.complete();
        return;
      }

      const nodeDir = path.join(cwd, this.id.replaceAll('/', '--'));
      Deno.mkdirSync(nodeDir, { recursive: true });
      if (!nodeDir) {
        subscriber.error(new Error('Unable to create execution directory for terraform'));
        return;
      }

      const account = options.providerStore.getProvider(this.inputs?.account || '');
      if (!account) {
        subscriber.error(new Error(`Invalid account: ${this.inputs?.account}`));
        return;
      }

      const service = account.resources[this.type] as ResourceService<any, any>;
      if (!service) {
        subscriber.error(new Error(`The ${account.type} provider doesn't support the ${this.type} resource`));
        return;
      } else if (!('apply' in service)) {
        subscriber.error(new Error(`The ${account.type} provider cannnot ${this.action} the ${this.type} resource`));
        return;
      }

      const writableService = service as WritableResourceService<any, any>;
      let applyObservable: Observable<ApplyOutputs<any>> | undefined;

      if (this.action === 'delete') {
        applyObservable = writableService.destroy({
          id: this.id,
          cwd: nodeDir,
          providerStore: options.providerStore,
          logger: options.logger,
          state: this.state ||
            (this.outputs
              ? {
                id: this.outputs.id,
              }
              : undefined),
        });
      } else if (!this.inputs) {
        subscriber.error(new Error(`Missing inputs for ${this.id}`));
      } else {
        applyObservable = writableService.apply(this.inputs, {
          id: this.id,
          cwd: nodeDir,
          providerStore: options.providerStore,
          logger: options.logger,
          state: this.state,
        });
      }

      applyObservable?.subscribe({
        next: (res) => {
          this.status = res.status;
          this.state = res.state;
          this.outputs = res.outputs;

          // Progogate the account if one was not specified
          if (this.outputs && !this.outputs.account) {
            this.outputs.account = this.inputs?.account;
          }
          subscriber.next(this);
        },
        complete: () => {
          this.status.state = 'complete';
          this.status.message = '';
          this.status.endTime = Date.now();
          subscriber.next(this);
          subscriber.complete();
        },
        error: (err) => {
          this.status.state = 'error';
          this.status.message = err.message;
          this.status.endTime = Date.now();
          subscriber.next(this);
          subscriber.error(err);
        },
      });
    });
  }
}
