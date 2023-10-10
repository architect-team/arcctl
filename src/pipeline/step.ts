import * as crypto from 'https://deno.land/std@0.177.0/node/crypto.ts';
import { Observable } from 'rxjs';
import * as path from 'std/path/mod.ts';
import { v4 } from 'uuid';
import { ApplyOutputs, ResourceService, WritableResourceService } from '../@providers/index.ts';
import { ProviderStore } from '../@providers/store.ts';
import { ResourceInputs, ResourceOutputs, ResourceType } from '../@resources/index.ts';
import { CloudNode } from '../cloud-graph/index.ts';
import { Apply, ApplyResponse, Plugin } from '../modules/index.ts';
import { ApplyOptions, StepAction, StepColor, StepStatus } from './types.ts';

export type PipelineStepOptions<T extends ResourceType> = {
  name: string;
  type: T;
  action: StepAction;
  image?: string;
  color?: StepColor;
  status?: StepStatus;
  hash?: string;
  component?: string;
  environment?: string;
  state?: any;
  inputs?: ResourceInputs[T];
  outputs?: ResourceOutputs[T];
  plugin: Plugin;
};

export class PipelineStep<T extends ResourceType = ResourceType> {
  name: string;
  type: T;
  action: StepAction;
  color: StepColor;
  status: StepStatus;
  image?: string;
  hash?: string;
  component?: string;
  environment?: string;
  state?: any;
  inputs?: ResourceInputs[T];
  outputs?: ResourceOutputs[T];
  plugin: Plugin;

  constructor(options: PipelineStepOptions<T>) {
    this.name = options.name;
    this.type = options.type;
    this.action = options.action;
    this.color = options.color || 'blue';
    this.status = options.status || {
      state: 'pending',
    };
    this.hash = options.hash;
    this.component = options.component;
    this.environment = options.environment;
    this.state = options.state;
    this.inputs = options.inputs;
    this.outputs = options.outputs;
    this.image = options.image;
    this.plugin = options.plugin;
  }

  get id(): string {
    return CloudNode.genId(this) + '-' + this.color;
  }

  get resource_id(): string {
    return CloudNode.genResourceId(this) + '-' + this.color;
  }

  public equals(step: PipelineStep): boolean {
    return this.name === step.name && this.type === step.type &&
      this.color === step.color && this.component === step.component &&
      this.environment === step.environment &&
      JSON.stringify(this.inputs) === JSON.stringify(step.inputs);
  }

  public async getHash(providerStore: ProviderStore): Promise<string> {
    const cwd = Deno.makeTempDirSync({ prefix: 'arcctl-' });

    const nodeDir = path.join(cwd, this.id.replaceAll('/', '--'));
    Deno.mkdirSync(nodeDir, { recursive: true });
    if (!nodeDir) {
      throw new Error('Unable to create execution directory for terraform');
    }

    const account = await providerStore.get(
      this.inputs?.account || '',
    );
    if (!account) {
      return crypto.createHash('sha256').update(JSON.stringify(this.inputs || { key: v4() })).digest('hex')
        .toString();
    }

    const service = account.resources[this.type] as ResourceService<any, any>;
    if (!service) {
      throw new Error(
        `The ${account.type} provider doesn't support the ${this.type} resource`,
      );
    }

    const writableService = service as WritableResourceService<any, any>;

    return writableService.getHash(this.inputs, {
      id: this.id,
      cwd: nodeDir,
      providerStore,
    });
  }

  private flattenObject(obj: Record<string, any>, path: string[] = []): Record<string, any> {
    return Object.keys(obj).reduce((acc: Record<string, any>, key) => {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        Object.assign(
          acc,
          this.flattenObject(obj[key], [
            ...path,
            key,
          ]),
        );
      } else {
        acc[[...path, key].join(':')] = obj[key];
      }
      return acc;
    }, {});
  }

  public applyModule(options: ApplyOptions): Observable<PipelineStep<T>> {
    return new Observable((subscriber) => {
      this.status.state = 'applying';
      this.status.startTime = Date.now();
      const inputs = this.flattenObject(this.inputs as any || {});
      Apply({
        datacenterid: 'datacenter',
        inputs: Object.entries(inputs) as [string, string][],
        image: this.image!,
        state: this.state,
        destroy: this.action === 'delete',
      }, { plugin: this.plugin, logger: options.logger }).then((response: ApplyResponse) => {
        this.state = this.action === 'delete' ? undefined : response.state;
        this.outputs = response.outputs as any || {};
        this.status.state = 'complete';
        this.status.endTime = Date.now();
        subscriber.next(this);
        subscriber.complete();
      }).catch((err: Error) => {
        this.status.state = 'error';
        this.status.message = err.message;
        this.status.endTime = Date.now();
        subscriber.next(this);
        subscriber.error(err);
      });
    });
  }

  public apply(options: ApplyOptions): Observable<PipelineStep<T>> {
    if (this.type === 'module') {
      return this.applyModule(options);
    }
    const cwd = options.cwd || Deno.makeTempDirSync({ prefix: 'arcctl-' });

    return new Observable((subscriber) => {
      if (this.action === 'no-op') {
        subscriber.complete();
        return;
      }

      const nodeDir = path.join(cwd, this.id.replaceAll('/', '--'));
      Deno.mkdirSync(nodeDir, { recursive: true });
      if (!nodeDir) {
        subscriber.error(
          new Error('Unable to create execution directory for terraform'),
        );
        return;
      }

      options.providerStore.get(
        this.inputs?.account || '',
      ).then((account) => {
        if (!account) {
          subscriber.error(new Error(`Invalid account: ${this.inputs?.account}`));
          return;
        }

        const service = account.resources[this.type] as ResourceService<any, any>;
        if (!service) {
          subscriber.error(
            new Error(
              `The ${account.type} provider doesn't support the ${this.type} resource`,
            ),
          );
          return;
        } else if (!('apply' in service)) {
          subscriber.error(
            new Error(
              `The ${account.type} provider cannnot ${this.action} the ${this.type} resource`,
            ),
          );
          return;
        }

        account.testCredentials().then((valid: boolean) => {
          if (!valid) {
            subscriber.error(
              new Error(
                `The ${account.type} provider credentials are invalid`,
              ),
            );
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
            }, this.inputs);
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
              this.status = {
                ...this.status,
                ...res.status,
              };
              this.state = res.state;
              this.outputs = res.outputs;

              // Progogate the account if one was not specified
              if (this.outputs && !(this.outputs as any).account) {
                (this.outputs as any).account = this.inputs?.account;
              }
              subscriber.next(this);
            },
            complete: () => {
              this.status.state = 'complete';
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
      });
    });
  }
}
