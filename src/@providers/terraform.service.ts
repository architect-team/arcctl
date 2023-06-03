import { Observable, Subscriber } from 'rxjs';
import { ResourceInputs, ResourceType } from '../@resources/index.ts';
import { ApplyOptions, ApplyOutputs, WritableResourceService } from './base.service.ts';
import { ProviderCredentials } from './credentials.ts';
import { ResourceModule } from './module.ts';
import { Construct } from 'constructs';
import { App } from 'cdktf';
import { CldCtlTerraformStack } from '../utils/stack.ts';
import { Terraform } from '../terraform/terraform.ts';
import { Logger } from 'winston';
import { TerraformVersion } from '../terraform/plugin.ts';
import * as path from 'std/path/mod.ts';

export type ModuleConstructor<T extends ResourceType, C extends ProviderCredentials> = new (
  scope: Construct,
  name: string,
  inputs: ResourceInputs[T],
) => ResourceModule<T, C>;

type TerraformResourceState =
  | {
      id: string;
    }
  | { terraform_version: string; [key: string]: any };

export abstract class TerraformResourceService<
  T extends ResourceType,
  C extends ProviderCredentials,
> extends WritableResourceService<T, C> {
  /**
   * The module used to create and manage an instance of the resource
   * using Terraform CDK
   *
   * @see https://developer.hashicorp.com/terraform/cdktf
   */
  abstract readonly construct: ModuleConstructor<T, C>;

  abstract readonly terraform_version: TerraformVersion;

  abstract configureTerraformProviders(scope: Construct): void;

  private tfInit(cwd: string, stack: CldCtlTerraformStack, terraform: Terraform, logger?: Logger): Deno.ChildProcess {
    const cmd = terraform.init(cwd, stack);
    if (logger) {
      cmd.stdout.pipeTo(
        new WritableStream({
          write(chunk) {
            logger.info(new TextDecoder().decode(chunk));
          },
        }),
      );

      cmd.stderr.pipeTo(
        new WritableStream({
          write(chunk) {
            logger.error(new TextDecoder().decode(chunk));
          },
        }),
      );
    }
    return cmd;
  }

  private tfPlan(cwd: string, terraform: Terraform, logger?: Logger): Deno.ChildProcess {
    const cmd = terraform.plan(cwd, 'plan');
    if (logger) {
      cmd.stdout.pipeTo(
        new WritableStream({
          write(chunk) {
            logger.info(new TextDecoder().decode(chunk));
          },
        }),
      );
      cmd.stderr.pipeTo(
        new WritableStream({
          write(chunk) {
            logger.error(new TextDecoder().decode(chunk));
          },
        }),
      );
    }
    return cmd;
  }

  private tfApply(cwd: string, terraform: Terraform, logger?: Logger): Deno.ChildProcess {
    const cmd = terraform.apply(cwd, 'plan');
    if (logger) {
      cmd.stdout.pipeTo(
        new WritableStream({
          write(chunk) {
            logger.info(new TextDecoder().decode(chunk));
          },
        }),
      );

      cmd.stderr.pipeTo(
        new WritableStream({
          write(chunk) {
            logger.error(new TextDecoder().decode(chunk));
          },
        }),
      );
    }
    return cmd;
  }

  private tfOutput(cwd: string, terraform: Terraform, logger?: Logger): Deno.ChildProcess {
    const cmd = terraform.output(cwd);
    if (logger) {
      cmd.stdout.pipeTo(
        new WritableStream({
          write(chunk) {
            logger.info(new TextDecoder().decode(chunk));
          },
        }),
      );

      cmd.stderr.pipeTo(
        new WritableStream({
          write(chunk) {
            logger.error(new TextDecoder().decode(chunk));
          },
        }),
      );
    }
    return cmd;
  }

  private async applyAsync(
    subscriber: Subscriber<ApplyOutputs<T>>,
    inputs: ResourceInputs[T],
    options: ApplyOptions<TerraformResourceState>,
  ): Promise<void> {
    const stateFile = path.join(options.cwd, 'terraform.tfstate');

    const app = new App({
      outdir: options.cwd,
    });
    const stack = new CldCtlTerraformStack(app, 'arcctl');
    this.configureTerraformProviders(stack);
    const { module, output: moduleOutput } = stack.addModule(this.construct, 'arcctl-module', inputs);

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
      Deno.writeFileSync(stateFile, new TextEncoder().encode(JSON.stringify(options.state)));
    } else if (options.state) {
      // State must be imported from an ID
      const imports = await module.genImports(this.credentials, options.state.id);

      // We have to run this before we can run `terraform import`
      await this.tfInit(options.cwd, stack, options.terraform, options.logger).status;
      initRan = true;

      for (const [key, value] of Object.entries(imports)) {
        await options.terraform.import(options.cwd, key, value).status;
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

      await this.tfInit(options.cwd, stack, options.terraform, options.logger).status;
    }

    subscriber.next({
      status: {
        state: 'starting',
        message: 'Generating diff',
        startTime,
      },
    });

    await this.tfPlan(options.cwd, options.terraform, options.logger).status;

    subscriber.next({
      status: {
        state: 'applying',
        message: 'Applying changes',
        startTime,
      },
    });

    await this.tfApply(options.cwd, options.terraform, options.logger).status;

    subscriber.next({
      status: {
        state: 'applying',
        message: 'Collecting outputs',
        startTime,
      },
    });

    const stateFileBuffer = await Deno.readFile(stateFile);
    options.state = JSON.parse(new TextDecoder().decode(stateFileBuffer));

    const { stdout: rawOutputs } = await this.tfOutput(options.cwd, options.terraform, options.logger).output();
    const parsedOutputs = JSON.parse(new TextDecoder().decode(rawOutputs));

    if (!(moduleOutput.friendlyUniqueId in parsedOutputs)) {
      subscriber.error(new Error('Failed to retrieve terraform outputs'));
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
  ): Promise<void> {
    const stateFile = path.join(options.cwd, 'terraform.tfstate');

    let app = new App({
      outdir: options.cwd,
    });
    let stack = new CldCtlTerraformStack(app, 'arcctl');
    this.configureTerraformProviders(stack);
    const { module } = stack.addModule(this.construct, 'arcctl-module', {} as any);

    const startTime = Date.now();
    subscriber.next({
      status: {
        state: 'starting',
        message: 'Importing resource state',
        startTime,
      },
    });

    if (options.state && 'terraform_version' in options.state) {
      Deno.writeFileSync(stateFile, new TextEncoder().encode(JSON.stringify(options.state)));
    } else if (options.state) {
      // State must be imported from an ID
      const imports = await module.genImports(this.credentials, options.state.id);

      // We have to run this before we can run `terraform import`
      await this.tfInit(options.cwd, stack, options.terraform, options.logger).status;

      for (const [key, value] of Object.entries(imports)) {
        await options.terraform.import(options.cwd, key, value).status;
      }
    }

    app = new App({ outdir: options.cwd });
    stack = new CldCtlTerraformStack(app, 'arcctl');
    this.configureTerraformProviders(stack);

    subscriber.next({
      status: {
        state: 'starting',
        message: 'Initializing terraform',
        startTime,
      },
    });

    await this.tfInit(options.cwd, stack, options.terraform, options.logger).status;

    subscriber.next({
      status: {
        state: 'starting',
        message: 'Generating diff',
        startTime,
      },
    });

    await this.tfPlan(options.cwd, options.terraform, options.logger).status;

    subscriber.next({
      status: {
        state: 'applying',
        message: 'Applying changes',
        startTime,
      },
    });

    await this.tfApply(options.cwd, options.terraform, options.logger).status;

    const stateFileBuffer = await Deno.readFile(stateFile);
    options.state = JSON.parse(new TextDecoder().decode(stateFileBuffer));

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
  }

  public apply(inputs: ResourceInputs[T], options: ApplyOptions<TerraformResourceState>): Observable<ApplyOutputs<T>> {
    return new Observable((subscriber) => {
      this.applyAsync(subscriber, inputs, options);
    });
  }

  public destroy(options: ApplyOptions<TerraformResourceState>): Observable<ApplyOutputs<T>> {
    return new Observable((subscriber) => {
      this.destroyAsync(subscriber, options);
    });
  }
}
