import { App, TerraformOutput, TerraformStack } from 'cdktf';
import { Construct } from 'constructs';
import * as crypto from 'https://deno.land/std@0.177.0/node/crypto.ts';
import { Buffer } from 'https://deno.land/std@0.190.0/io/buffer.ts';
import { Observable, Subscriber } from 'rxjs';
import * as path from 'std/path/mod.ts';
import { Logger } from 'winston';
import { ResourceInputs, ResourceType } from '../@resources/index.ts';
import { createProviderFileConstructor } from '../cdktf-modules/provider-file.ts';
import { TerraformVersion } from '../terraform/plugin.ts';
import { Terraform } from '../terraform/terraform.ts';
import CloudCtlConfig from '../utils/config.ts';
import { CldCtlTerraformStack } from '../utils/stack.ts';
import { ApplyOptions, ApplyOutputs, WritableResourceService } from './base.service.ts';
import { ProviderCredentials } from './credentials.ts';
import { ResourceModuleConstructor } from './module.ts';

export type TerraformResourceState =
  | {
    id: string;
  }
  | { terraform_version: string; stateFile: any; lockFile: any };

export abstract class TerraformResourceService<
  T extends ResourceType,
  C extends ProviderCredentials,
> extends WritableResourceService<T, C> {
  private _terraform?: Terraform;

  /**
   * The module used to create and manage an instance of the resource
   * using Terraform CDK
   *
   * @see https://developer.hashicorp.com/terraform/cdktf
   */
  abstract readonly construct: ResourceModuleConstructor<T, C>;

  abstract readonly terraform_version: TerraformVersion;

  configureTerraformProviders(scope: Construct): void {}

  private async getTerraformPlugin(): Promise<Terraform> {
    if (this._terraform) {
      return this._terraform;
    }

    this._terraform = await Terraform.generate(CloudCtlConfig.getPluginDirectory(), this.terraform_version);

    return this._terraform;
  }

  private async tfShow(cwd: string): Promise<Deno.CommandOutput> {
    const terraform = await this.getTerraformPlugin();
    const cmd = terraform.show(cwd);

    const stdout = new Buffer();
    const stderr = new Buffer();

    cmd.stdout.pipeTo(
      new WritableStream({
        write(chunk) {
          stdout.write(chunk);
        },
      }),
    );

    cmd.stderr.pipeTo(
      new WritableStream({
        write(chunk) {
          stderr.write(chunk);
        },
      }),
    );

    const status = await cmd.status;
    return {
      ...status,
      stdout: stdout.bytes(),
      stderr: stderr.bytes(),
    };
  }

  private async tfInit(cwd: string, stack: TerraformStack, logger?: Logger): Promise<Deno.CommandOutput> {
    const terraform = await this.getTerraformPlugin();

    const cmd = terraform.init(cwd, stack);

    const stdout = new Buffer();
    const stderr = new Buffer();

    cmd.stdout.pipeTo(
      new WritableStream({
        write(chunk) {
          stdout.write(chunk);
          logger?.info(new TextDecoder().decode(chunk));
        },
      }),
    );

    cmd.stderr.pipeTo(
      new WritableStream({
        write(chunk) {
          stderr.write(chunk);
          logger?.error(new TextDecoder().decode(chunk));
        },
      }),
    );

    const status = await cmd.status;
    return {
      ...status,
      stdout: stdout.bytes(),
      stderr: stderr.bytes(),
    };
  }

  private async tfPlan(
    cwd: string,
    options?: { logger?: Logger; refresh?: boolean; destroy?: boolean },
  ): Promise<Deno.CommandOutput> {
    const terraform = await this.getTerraformPlugin();

    const cmd = terraform.plan(cwd, 'plan', options);
    const stdout = new Buffer();
    const stderr = new Buffer();

    cmd.stdout.pipeTo(
      new WritableStream({
        write(chunk) {
          stdout.write(chunk);
          options?.logger?.info(new TextDecoder().decode(chunk));
        },
      }),
    );

    cmd.stderr.pipeTo(
      new WritableStream({
        write(chunk) {
          stderr.write(chunk);
          options?.logger?.error(new TextDecoder().decode(chunk));
        },
      }),
    );

    const status = await cmd.status;
    return {
      ...status,
      stdout: stdout.bytes(),
      stderr: stderr.bytes(),
    };
  }

  private async tfApply(cwd: string, logger?: Logger): Promise<Deno.CommandOutput> {
    const terraform = await this.getTerraformPlugin();

    const cmd = terraform.apply(cwd, 'plan');
    const stdout = new Buffer();
    const stderr = new Buffer();

    cmd.stdout.pipeTo(
      new WritableStream({
        write(chunk) {
          stdout.write(chunk);
          logger?.info(new TextDecoder().decode(chunk));
        },
      }),
    );

    cmd.stderr.pipeTo(
      new WritableStream({
        write(chunk) {
          stderr.write(chunk);
          logger?.error(new TextDecoder().decode(chunk));
        },
      }),
    );

    const status = await cmd.status;
    return {
      ...status,
      stdout: stdout.bytes(),
      stderr: stderr.bytes(),
    };
  }

  private async tfOutput(cwd: string, logger?: Logger): Promise<Deno.CommandOutput> {
    const terraform = await this.getTerraformPlugin();

    const cmd = terraform.output(cwd);

    const stdout = new Buffer();
    const stderr = new Buffer();

    cmd.stdout.pipeTo(
      new WritableStream({
        write(chunk) {
          stdout.write(chunk);
          logger?.info(new TextDecoder().decode(chunk));
        },
      }),
    );

    cmd.stderr.pipeTo(
      new WritableStream({
        write(chunk) {
          stderr.write(chunk);
          logger?.error(new TextDecoder().decode(chunk));
        },
      }),
    );

    const status = await cmd.status;
    return {
      ...status,
      stdout: stdout.bytes(),
      stderr: stderr.bytes(),
    };
  }

  private async applyAsync(
    subscriber: Subscriber<ApplyOutputs<T>>,
    inputs: ResourceInputs[T],
    options: ApplyOptions<TerraformResourceState>,
  ): Promise<void> {
    const cwd = options.cwd || Deno.makeTempDirSync();
    const stateFile = path.join(cwd, 'terraform.tfstate');
    const lockFile = path.join(cwd, '.terraform.lock.hcl');

    const app = new App({
      outdir: cwd,
    });
    const fileStorageDir = path.join(options.providerStore.storageDir, options.id.replaceAll('/', '--'));
    Deno.mkdirSync(fileStorageDir, { recursive: true });
    const stack = new this.construct(app, {
      id: options.id,
      inputs,
      accountName: this.accountName,
      credentials: this.credentials,
      providerStore: this.providerStore,
      FileConstruct: createProviderFileConstructor(fileStorageDir),
    });
    const moduleOutput = new TerraformOutput(stack, `${options.id}-output`, {
      value: stack.outputs,
      sensitive: true,
    });
    this.configureTerraformProviders(stack);
    const startTime = Date.now();
    subscriber.next({
      status: {
        state: 'starting',
        message: 'Importing resource state',
        startTime,
      },
    });

    let initRan = false;
    if (options.state && 'terraform_version' in options.state) {
      Deno.writeFileSync(stateFile, new TextEncoder().encode(JSON.stringify(options.state.stateFile)));
      Deno.writeFileSync(lockFile, new TextEncoder().encode(options.state.lockFile));
    } else if (options.state) {
      // State must be imported from an ID
      const imports = await stack.genImports(options.state.id);

      // We have to run this before we can run `terraform import`
      const { stderr: init_stderr } = await this.tfInit(cwd, stack, options.logger);
      if (init_stderr && init_stderr.length > 0) {
        subscriber.error(new TextDecoder().decode(init_stderr));
        return;
      }
      initRan = true;

      const terraform = await this.getTerraformPlugin();
      for (const [key, value] of Object.entries(imports)) {
        await terraform.import(cwd, key, value).status;
      }
    }

    if (!initRan) {
      subscriber.next({
        status: {
          state: 'starting',
          message: 'Initializing terraform',
          startTime,
        },
      });

      const { stderr: init_stderr } = await this.tfInit(cwd, stack, options.logger);
      if (init_stderr && init_stderr.length > 0) {
        subscriber.error(new TextDecoder().decode(init_stderr));
        return;
      }
    }

    subscriber.next({
      status: {
        state: 'starting',
        message: 'Generating diff',
        startTime,
      },
    });

    const { stderr: plan_stderr } = await this.tfPlan(cwd, {
      logger: options.logger,
    });
    if (plan_stderr && plan_stderr.length > 0) {
      subscriber.error(new TextDecoder().decode(plan_stderr));
      return;
    }

    subscriber.next({
      status: {
        state: 'applying',
        message: 'Applying changes',
        startTime,
      },
    });

    const { stderr: apply_stderr } = await this.tfApply(cwd, options.logger);
    if (apply_stderr && apply_stderr.length > 0) {
      subscriber.error(new TextDecoder().decode(apply_stderr));
      return;
    }

    subscriber.next({
      status: {
        state: 'applying',
        message: 'Collecting outputs',
        startTime,
      },
    });

    const stateFileBuffer = await Deno.readFile(stateFile);
    const lockFileBuffer = await Deno.readFile(lockFile);
    const stateFileContents = JSON.parse(new TextDecoder().decode(stateFileBuffer));
    options.state = {
      terraform_version: stateFileContents.terraform_version,
      stateFile: JSON.parse(new TextDecoder().decode(stateFileBuffer)),
      lockFile: new TextDecoder().decode(lockFileBuffer),
    };

    const { stdout: rawOutputs, stderr: output_stderr } = await this.tfOutput(cwd, options.logger);
    if (output_stderr && output_stderr.length > 0) {
      subscriber.error(new TextDecoder().decode(output_stderr));
      return;
    }
    const parsedOutputs = JSON.parse(new TextDecoder().decode(rawOutputs));

    await Deno.remove(cwd, { recursive: true });

    if (!parsedOutputs) {
      subscriber.error(new Error('Failed to retrieve terraform outputs'));
    } else if (!(moduleOutput.friendlyUniqueId in parsedOutputs)) {
      subscriber.error(
        new Error(
          `Terraform outputs don't contain required key: ${moduleOutput.friendlyUniqueId}`,
        ),
      );
      return;
    }

    subscriber.next({
      status: {
        state: 'complete',
        message: '',
        startTime,
        endTime: Date.now(),
      },
      outputs: parsedOutputs[moduleOutput.friendlyUniqueId].value,
      state: options.state,
    });
    subscriber.complete();
  }

  private async destroyAsync(
    subscriber: Subscriber<ApplyOutputs<T>>,
    options: ApplyOptions<TerraformResourceState>,
    inputs?: ResourceInputs[T],
  ): Promise<void> {
    try {
      options.cwd = options.cwd || Deno.makeTempDirSync();
      const cwd = options.cwd;
      const stateFile = path.join(cwd, 'terraform.tfstate');
      const lockFile = path.join(cwd, '.terraform.lock.hcl');
      const app = new App({
        outdir: cwd,
      });
      const fileStorageDir = path.join(options.providerStore.storageDir, options.id);
      Deno.mkdirSync(fileStorageDir, { recursive: true });
      const stack = new this.construct(app, {
        id: options.id,
        FileConstruct: createProviderFileConstructor(fileStorageDir),
        accountName: this.accountName,
        credentials: this.credentials,
        providerStore: this.providerStore,
        inputs,
      });
      this.configureTerraformProviders(stack);

      const startTime = Date.now();
      subscriber.next({
        status: {
          state: 'starting',
          message: 'Importing resource state',
          startTime,
        },
      });

      if (options.state && 'terraform_version' in options.state) {
        Deno.writeFileSync(stateFile, new TextEncoder().encode(JSON.stringify(options.state.stateFile)));
        Deno.writeFileSync(lockFile, new TextEncoder().encode(options.state.lockFile));
      } else if (options.state) {
        // State must be imported from an ID
        const imports = await stack.genImports(options.state.id);

        // We have to run this before we can run `terraform import`
        const { stderr: init_stderr } = await this.tfInit(cwd, stack, options.logger);
        if (init_stderr && init_stderr.length > 0) {
          subscriber.error(new TextDecoder().decode(init_stderr));
          return;
        }

        const terraform = await this.getTerraformPlugin();
        for (const [key, value] of Object.entries(imports)) {
          await terraform.import(cwd, key, value).status;
        }
      }

      await stack.afterImport(options);

      subscriber.next({
        status: {
          state: 'starting',
          message: 'Initializing terraform',
          startTime,
        },
      });

      const { stderr: init_stderr } = await this.tfInit(cwd, stack, options.logger);
      if (init_stderr && init_stderr.length > 0) {
        subscriber.error(new TextDecoder().decode(init_stderr));
        return;
      }

      subscriber.next({
        status: {
          state: 'starting',
          message: 'Generating diff',
          startTime,
        },
      });

      const { stderr: plan_stderr } = await this.tfPlan(cwd, {
        logger: options.logger,
        destroy: true,
      });
      if (plan_stderr && plan_stderr.length > 0) {
        subscriber.error(new TextDecoder().decode(plan_stderr));
        return;
      }

      subscriber.next({
        status: {
          state: 'applying',
          message: 'Applying changes',
          startTime,
        },
      });

      const { stderr: apply_stderr } = await this.tfApply(options.cwd, options.logger);
      if (apply_stderr && apply_stderr.length > 0) {
        subscriber.error(new TextDecoder().decode(apply_stderr));
        return;
      }

      const stateFileBuffer = await Deno.readFile(stateFile);
      const lockFileBuffer = await Deno.readFile(lockFile);
      const stateFileContents = JSON.parse(new TextDecoder().decode(stateFileBuffer));
      options.state = {
        terraform_version: stateFileContents.terraform_version,
        stateFile: JSON.parse(new TextDecoder().decode(stateFileBuffer)),
        lockFile: new TextDecoder().decode(lockFileBuffer),
      };

      await Deno.remove(cwd, { recursive: true });

      subscriber.next({
        status: {
          state: 'complete',
          message: '',
          startTime,
          endTime: Date.now(),
        },
        state: options.state,
      });
      subscriber.complete();
    } catch (err) {
      console.error(err);
      subscriber.error(err);
    }
  }

  public getHash(inputs: ResourceInputs[T], options: ApplyOptions<TerraformResourceState>): string {
    const app = new App({
      outdir: options.cwd,
    });
    const stack = new CldCtlTerraformStack(app, 'arcctl');
    this.configureTerraformProviders(stack);
    const fileStorageDir = path.join(options.providerStore.storageDir, options.id.replaceAll('/', '--'));
    Deno.mkdirSync(fileStorageDir, { recursive: true });
    stack.addModule(this.construct, {
      id: options.id,
      inputs,
      accountName: this.accountName,
      credentials: this.credentials,
      providerStore: this.providerStore,
      FileConstruct: createProviderFileConstructor(fileStorageDir),
    });
    const terraform = stack.toTerraform();
    const stringStack = typeof terraform === 'string' ? terraform : JSON.stringify(terraform);
    return crypto.createHash('sha256').update(stringStack).digest('hex').toString();
  }

  public apply(inputs: ResourceInputs[T], options: ApplyOptions<TerraformResourceState>): Observable<ApplyOutputs<T>> {
    return new Observable((subscriber) => {
      this.applyAsync(subscriber, inputs, options);
    });
  }

  public destroy(
    options: ApplyOptions<TerraformResourceState>,
    inputs?: ResourceInputs[T],
  ): Observable<ApplyOutputs<T>> {
    return new Observable((subscriber) => {
      this.destroyAsync(subscriber, options, inputs);
    });
  }
}
