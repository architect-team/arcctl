import {
  CrudResourceService,
  Provider,
  TerraformResourceService,
} from '../@providers/index.js';
import {
  ResourceInputs,
  ResourceOutputs,
  ResourceType,
} from '../@resources/index.js';
import { CloudNode } from '../cloud-graph/index.js';
import { CldCtlTerraformStack } from '../utils/stack.js';
import {
  ApplyStepOptions,
  StepAction,
  StepColor,
  StepStatus,
} from './types.js';
import { App } from 'cdktf';
import deepmerge from 'deepmerge';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { Observable, Subscriber } from 'rxjs';

export type PipelineStepOptions<T extends ResourceType> = {
  name: string;
  type: T;
  action: StepAction;
  color: StepColor;
  status?: StepStatus;
  component?: string;
  environment?: string;
  state?: any;
  inputs?: ResourceInputs[T];
  resource?: { id: string; account: string };
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
  resource?: { id: string; account: string };

  constructor(options: PipelineStepOptions<T>) {
    this.name = options.name;
    this.type = options.type;
    this.action = options.action;
    this.color = options.color;
    this.status = options.status || {
      state: 'pending',
    };
    this.component = options.component;
    this.environment = options.environment;
    this.state = options.state;
    this.inputs = options.inputs;
    this.resource = options.resource;
  }

  get id(): string {
    return CloudNode.genId(this) + '-' + this.color;
  }

  get resource_id(): string {
    return CloudNode.genResourceId(this) + '-' + this.color;
  }

  private async applyStack(
    subscriber: Subscriber<PipelineStep<T>>,
    stack: CldCtlTerraformStack,
    options: ApplyStepOptions & {
      cwd: string;
      state: StepStatus['state'];
    },
  ): Promise<void> {
    this.status.state = 'starting';
    this.status.message = 'Initializing terraform';
    this.status.startTime = Date.now();
    subscriber.next(this);

    const initCmd = options.terraform.init(options.cwd, stack);
    if (options.logger) {
      initCmd.stdout?.on('data', (chunk) => {
        options.logger?.info(chunk);
      });
      initCmd.stderr?.on('data', (chunk) => {
        options.logger?.error(chunk);
      });
    }
    await initCmd;

    this.status.state = 'starting';
    this.status.message = 'Generating diff';
    subscriber.next(this);

    const planCmd = options.terraform.plan(options.cwd, 'plan');
    if (options.logger) {
      planCmd.stdout?.on('data', (chunk) => {
        options.logger?.info(chunk);
      });
      planCmd.stderr?.on('data', (chunk) => {
        options.logger?.error(chunk);
      });
    }
    await planCmd;

    this.status.state = options.state;
    this.status.message = 'Applying changes';
    subscriber.next(this);

    const applyCmd = options.terraform.apply(options.cwd, 'plan');
    if (options.logger) {
      applyCmd.stdout?.on('data', (chunk) => {
        options.logger?.info(chunk);
      });
      applyCmd.stderr?.on('data', (chunk) => {
        options.logger?.error(chunk);
      });
    }
    await applyCmd;
  }

  /**
   * Apply the changes to the node using terraform
   */
  private async terraformApply(
    subscriber: Subscriber<PipelineStep<T>>,
    provider: Provider,
    service: TerraformResourceService<T, any>,
    options: ApplyStepOptions,
  ): Promise<void> {
    const cwd =
      options.cwd || fs.mkdtempSync(path.join(os.tmpdir(), 'arcctl-'));
    const nodeDir = path.join(cwd, this.id.replaceAll('/', '--'));
    const stateFile = path.join(nodeDir, 'terraform.tfstate');
    const alreadyExists = Boolean(this.state);

    let app = new App({
      outdir: nodeDir,
    });
    let stack = new CldCtlTerraformStack(app, this.id);
    provider.configureTerraformProviders(stack);
    const { module } = stack.addModule(
      service.construct,
      this.resource_id,
      this.inputs || ({} as any),
    );

    if (this.state) {
      // State exists and doesn't need to be imported
      fs.writeFileSync(stateFile, JSON.stringify(this.state));
    } else if (this.resource?.id) {
      // State must be imported first
      const imports = await module.genImports(
        provider.credentials,
        this.resource.id,
      );
      for (const [key, value] of Object.entries(imports)) {
        await options.terraform.import(nodeDir, key, value);
      }
    }

    if (this.action === 'delete') {
      app = new App({ outdir: nodeDir });
      stack = new CldCtlTerraformStack(app, this.id);
      provider.configureTerraformProviders(stack);
    }

    await this.applyStack(subscriber, stack, {
      ...options,
      cwd: nodeDir,
      state: this.action === 'delete' ? 'destroying' : 'applying',
    });

    const stateString = fs.readFileSync(stateFile, 'utf8');
    this.state = JSON.parse(stateString);

    this.status.state = this.action === 'delete' ? 'destroying' : 'applying';
    this.status.message = `Running post-${this.action} hooks`;
    subscriber.next(this);

    try {
      if (this.action === 'delete' && service.hooks.afterDelete) {
        await service.hooks.afterDelete();
      } else if (service.hooks.afterCreate && !alreadyExists) {
        const outputs = await this.getOutputs(options);
        if (!outputs) {
          throw new Error(`Failed to acquired outputs for ${this.id}`);
        }

        await service.hooks.afterCreate(
          options.providerStore,
          this.inputs!,
          outputs,
        );
      }
    } catch (err: any) {
      this.status.state = 'error';
      this.status.message = err.message || '';
      this.status.endTime = Date.now();
      subscriber.next(this);
      subscriber.error(err);
    }

    this.status.state = 'complete';
    this.status.message = '';
    this.status.endTime = Date.now();
    subscriber.next(this);
    subscriber.complete();
  }

  /**
   * Apply the changes to the node using CRUD API calls
   */
  private async crudApply(
    subscriber: Subscriber<PipelineStep<T>>,
    service: CrudResourceService<T>,
  ): Promise<void> {
    this.status.state = this.action === 'delete' ? 'destroying' : 'applying';
    this.status.startTime = Date.now();
    subscriber.next(this);

    if (this.action === 'delete') {
      if (!this.resource?.id) {
        throw new Error(
          `Missing resource ID for ${this.id} which is scheduled for deletion`,
        );
      }

      await service.delete(this.resource.id);
    } else if (this.state && this.inputs) {
      // Updating
      const partial = await service.update(this.inputs);
      this.state = deepmerge(this.state, partial);
    } else if (this.inputs) {
      // Creating
      this.state = await service.create(this.inputs);
    } else {
      throw new Error(`Something went wrong applying changes to ${this.id}`);
    }
  }

  public apply(options: ApplyStepOptions): Observable<PipelineStep<T>> {
    const cwd =
      options.cwd || fs.mkdtempSync(path.join(os.tmpdir(), 'arcctl-'));

    return new Observable((subscriber) => {
      if (this.action === 'no-op') {
        subscriber.complete();
        return;
      }

      const nodeDir = path.join(cwd, this.id.replaceAll('/', '--'));
      fs.mkdirSync(nodeDir, { recursive: true });
      if (!nodeDir) {
        subscriber.error(
          new Error('Unable to create execution directory for terraform'),
        );
        return;
      }

      const account = options.providerStore.getProvider(
        this.inputs?.account || this.resource?.account || '',
      );
      if (!account) {
        subscriber.error(
          new Error(
            `Invalid account: ${
              this.inputs?.account || this.resource?.account
            }`,
          ),
        );
        return;
      }

      const service = account.resources[this.type];
      if (!service) {
        subscriber.error(
          new Error(
            `The ${account.type} provider doesn't support the ${this.type} resource`,
          ),
        );
        return;
      }

      let promise: Promise<void>;
      if ('construct' in service) {
        promise = this.terraformApply(
          subscriber,
          account,
          service as TerraformResourceService<T, any>,
          {
            ...options,
            cwd: nodeDir,
          },
        );
      } else {
        promise = this.crudApply(
          subscriber,
          service as CrudResourceService<T>,
          {
            ...options,
            cwd: nodeDir,
          },
        );
      }

      promise
        .then(() => {
          this.status.state = 'complete';
          this.status.message = '';
          this.status.endTime = Date.now();
          subscriber.next(this);
          subscriber.complete();
        })
        .catch((err) => {
          this.status.state = 'error';
          this.status.message = err.message || '';
          this.status.endTime = Date.now();
          subscriber.next(this);
          subscriber.error(err);
        });
    });
  }

  public async getOutputs(
    options: ApplyStepOptions,
  ): Promise<ResourceOutputs[T] | undefined> {
    if (!this.state || this.action === 'delete') {
      return undefined;
    }

    const account = options.providerStore.getProvider(
      this.inputs?.account || this.resource?.account || '',
    );
    if (!account) {
      throw new Error(
        `Invalid account: ${this.inputs?.account || this.resource?.account}`,
      );
    }

    const service = account.resources[this.type];
    if (!service) {
      throw new Error(
        `The ${account.type} provider doesn't support the ${this.type} resource`,
      );
    }

    if ('construct' in service) {
      const tfService = service as TerraformResourceService<T, any>;
      const cwd =
        options.cwd || fs.mkdtempSync(path.join(os.tmpdir(), 'arcctl-'));
      const nodeDir = path.join(cwd, this.id.replaceAll('/', '--'));
      fs.writeFileSync(
        path.join(nodeDir, 'terraform.tfstate'),
        JSON.stringify(this.state),
      );
      const app = new App({
        outdir: nodeDir,
      });
      const stack = new CldCtlTerraformStack(app, this.id);
      account.configureTerraformProviders(stack);
      const { output: tfOutput } = stack.addModule(
        tfService.construct,
        this.resource_id,
        this.inputs!,
      );

      const { stdout: rawOutputs } = await options.terraform.output(nodeDir);
      const parsedOutputs = JSON.parse(rawOutputs);
      return parsedOutputs[tfOutput.friendlyUniqueId].value;
    } else {
      return this.state;
    }
  }
}
