import { App } from "cdktf";
import { Construct } from "constructs";
import { Buffer } from "https://deno.land/std@0.190.0/io/buffer.ts";
import { Observable, Subscriber } from "rxjs";
import * as path from "std/path/mod.ts";
import { Logger } from "winston";
import { ResourceInputs, ResourceType } from "../@resources/index.ts";
import { createProviderFileConstructor } from "../cdktf-modules/provider-file.ts";
import { ArchitectPlugin } from "../index.ts";
import { TerraformVersion } from "../terraform/plugin.ts";
import { Terraform } from "../terraform/terraform.ts";
import CloudCtlConfig from "../utils/config.ts";
import { CldCtlTerraformStack } from "../utils/stack.ts";
import {
  ApplyOptions,
  ApplyOutputs,
  WritableResourceService,
} from "./base.service.ts";
import { ProviderCredentials } from "./credentials.ts";
import { ResourceModuleConstructor } from "./module.ts";

type TerraformResourceState =
  | {
    id: string;
  }
  | { terraform_version: string; [key: string]: any };

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

  abstract configureTerraformProviders(scope: Construct): void;

  private async getTerraformPlugin(): Promise<Terraform> {
    if (this._terraform) {
      return this._terraform;
    }

    this._terraform = await Terraform.generate(
      CloudCtlConfig.getPluginDirectory(),
      this.terraform_version,
    );

    return this._terraform;
  }

  private setTerraformPlugin(plugin: ArchitectPlugin) {
    this._terraform = new Terraform(plugin);
  }

  private async tfInit(
    cwd: string,
    stack: CldCtlTerraformStack,
    logger?: Logger,
  ): Promise<Deno.CommandOutput> {
    const terraform = await this.getTerraformPlugin();

    const cmd = terraform.init(cwd, stack);

    const stdout = new Buffer();
    const stderr = new Buffer();

    if (cmd.stdout?.pipeTo) {
      cmd.stdout.pipeTo(
        new WritableStream({
          write(chunk) {
            stdout.write(chunk);
            logger?.info(new TextDecoder().decode(chunk));
          },
        }),
      );
    } //else if (cmd.stdout?.pipe) {
    //   cmd.stdout.pipe(
    //     new WritableStream({
    //       write(chunk) {
    //         stdout.write(chunk);
    //         logger?.info(new TextDecoder().decode(chunk));
    //       },
    //     }),
    //   );
    // }

    if (cmd.stderr?.pipeTo) {
      cmd.stderr.pipeTo(
        new WritableStream({
          write(chunk) {
            stderr.write(chunk);
            logger?.error(new TextDecoder().decode(chunk));
          },
        }),
      );
    } //else if (cmd.stderr?.pipe) {
    //   cmd.stderr.pipe(
    //     new WritableStream({
    //       write(chunk) {
    //         stderr.write(chunk);
    //         logger?.info(new TextDecoder().decode(chunk));
    //       },
    //     }),
    //   );
    // }

    let status;
    if (cmd.status) {
      status = await cmd.status;
    } else { // TODO: find out how to best differentiate between deno and execa process types to find out what to await
      status = (await cmd).exitCode;
    }

    return {
      ...status,
      stdout: stdout.bytes(),
      stderr: stderr.bytes(),
    };
  }

  private async tfPlan(
    cwd: string,
    logger?: Logger,
  ): Promise<Deno.CommandOutput> {
    const terraform = await this.getTerraformPlugin();

    const cmd = terraform.plan(cwd, "plan");
    const stdout = new Buffer();
    const stderr = new Buffer();

    if (cmd.stdout?.pipeTo) {
      cmd.stdout.pipeTo(
        new WritableStream({
          write(chunk) {
            stdout.write(chunk);
            logger?.info(new TextDecoder().decode(chunk));
          },
        }),
      );
    } //else if (cmd.stdout?.pipe) {
    //   cmd.stdout.pipe(
    //     new WritableStream({
    //       write(chunk) {
    //         stdout.write(chunk);
    //         logger?.info(new TextDecoder().decode(chunk));
    //       },
    //     }),
    //   );
    // }

    if (cmd.stderr?.pipeTo) {
      cmd.stderr.pipeTo(
        new WritableStream({
          write(chunk) {
            stderr.write(chunk);
            logger?.error(new TextDecoder().decode(chunk));
          },
        }),
      );
    } //else if (cmd.stderr?.pipe) {
    //   cmd.stderr.pipe(
    //     new WritableStream({
    //       write(chunk) {
    //         stderr.write(chunk);
    //         logger?.info(new TextDecoder().decode(chunk));
    //       },
    //     }),
    //   );
    // }

    let status;
    if (cmd.status) {
      status = await cmd.status;
    } else {
      status = (await cmd).exitCode;
    }

    return {
      ...status,
      stdout: stdout.bytes(),
      stderr: stderr.bytes(),
    };
  }

  private async tfApply(
    cwd: string,
    logger?: Logger,
  ): Promise<Deno.CommandOutput> {
    const terraform = await this.getTerraformPlugin();

    const cmd = terraform.apply(cwd, "plan");
    const stdout = new Buffer();
    const stderr = new Buffer();

    if (cmd.stdout?.pipeTo) {
      cmd.stdout.pipeTo(
        new WritableStream({
          write(chunk) {
            stdout.write(chunk);
            logger?.info(new TextDecoder().decode(chunk));
          },
        }),
      );
    } //else if (cmd.stdout?.pipe) {
    //   cmd.stdout.pipe(
    //     new WritableStream({
    //       write(chunk) {
    //         stdout.write(chunk);
    //         logger?.info(new TextDecoder().decode(chunk));
    //       },
    //     }),
    //   );
    // }

    if (cmd.stderr?.pipeTo) {
      cmd.stderr.pipeTo(
        new WritableStream({
          write(chunk) {
            stderr.write(chunk);
            logger?.error(new TextDecoder().decode(chunk));
          },
        }),
      );
    } //else if (cmd.stderr?.pipe) {
    //   cmd.stderr.pipe(
    //     new WritableStream({
    //       write(chunk) {
    //         stderr.write(chunk);
    //         logger?.info(new TextDecoder().decode(chunk));
    //       },
    //     }),
    //   );
    // }

    let status;
    if (cmd.status) {
      status = await cmd.status;
    } else {
      status = (await cmd).exitCode;
    }

    return {
      ...status,
      stdout: stdout.bytes(),
      stderr: stderr.bytes(),
    };
  }

  private async tfOutput(
    cwd: string,
    logger?: Logger,
  ): Promise<Deno.CommandOutput> {
    const terraform = await this.getTerraformPlugin();

    const cmd = terraform.output(cwd);
    console.log("********COMMAND");
    console.log(cmd);

    const stdout = new Buffer();
    const stderr = new Buffer();

    if (cmd.stdout?.pipeTo) {
      cmd.stdout.pipeTo(
        new WritableStream({
          write(chunk) {
            stdout.write(chunk);
            logger?.info(new TextDecoder().decode(chunk));
          },
        }),
      );
    } else if (cmd.stdout?.pipe) {
      console.log("****PIPE STDOUT");
      cmd.stdout.pipe(
        new WritableStream({
          write(chunk) {
            stdout.write(chunk);
            logger?.info(new TextDecoder().decode(chunk));
          },
        }),
      );
    }

    if (cmd.stderr?.pipeTo) {
      cmd.stderr.pipeTo(
        new WritableStream({
          write(chunk) {
            stderr.write(chunk);
            logger?.error(new TextDecoder().decode(chunk));
          },
        }),
      );
    } else if (cmd.stderr?.pipe) {
      console.log("****PIPE STDERR");
      cmd.stderr.pipe(
        new WritableStream({
          write(chunk) {
            stderr.write(chunk);
            logger?.info(new TextDecoder().decode(chunk));
          },
        }),
      );
    }

    let status;
    if (cmd.status) {
      status = await cmd.status;
    } else {
      status = (await cmd).exitCode;
    }

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
    const stateFile = path.join(options.cwd, "terraform.tfstate");
    const app = new App({
      outdir: options.cwd,
    });
    const stack = new CldCtlTerraformStack(app, "arcctl");
    this.configureTerraformProviders(stack);
    const fileStorageDir = path.join(
      options.providerStore.storageDir,
      options.id.replaceAll("/", "--"),
    );
    Deno.mkdirSync(fileStorageDir, { recursive: true });
    const { module, output: moduleOutput } = stack.addModule(this.construct, {
      id: options.id,
      inputs,
      accountName: this.accountName,
      credentials: this.credentials,
      providerStore: this.providerStore,
      FileConstruct: createProviderFileConstructor(fileStorageDir),
    });

    const startTime = Date.now();
    subscriber.next({
      status: {
        state: "starting",
        message: "Importing resource state",
        startTime,
      },
    });

    let initRan = false;
    if (options.state && "terraform_version" in options.state) {
      Deno.writeFileSync(
        stateFile,
        new TextEncoder().encode(JSON.stringify(options.state)),
      );
    } else if (options.state) {
      // State must be imported from an ID
      const imports = await module.genImports(options.state.id);

      // We have to run this before we can run `terraform import`
      await this.tfInit(options.cwd, stack, options.logger);
      initRan = true;

      const terraform = await this.getTerraformPlugin();
      for (const [key, value] of Object.entries(imports)) {
        await terraform.import(options.cwd, key, value).status;
      }
    }

    if (!initRan) {
      subscriber.next({
        status: {
          state: "starting",
          message: "Initializing terraform",
          startTime,
        },
      });
      await this.tfInit(options.cwd, stack, options.logger);
    }

    subscriber.next({
      status: {
        state: "starting",
        message: "Generating diff",
        startTime,
      },
    });

    await this.tfPlan(options.cwd, options.logger);

    subscriber.next({
      status: {
        state: "applying",
        message: "Applying changes",
        startTime,
      },
    });

    const { stderr } = await this.tfApply(options.cwd, options.logger);
    if (stderr && stderr.length > 0) {
      subscriber.error(new TextDecoder().decode(stderr));
      return;
    }

    subscriber.next({
      status: {
        state: "applying",
        message: "Collecting outputs",
        startTime,
      },
    });

    const stateFileBuffer = await Deno.readFile(stateFile);
    options.state = JSON.parse(new TextDecoder().decode(stateFileBuffer));

    const { stdout: rawOutputs } = await this.tfOutput(
      options.cwd,
      options.logger,
    );
    console.log("********OUTPUTS");
    console.log(rawOutputs);
    console.log(new TextDecoder().decode(rawOutputs));
    const parsedOutputs = JSON.parse(new TextDecoder().decode(rawOutputs)); // TODO: find out why this throws an error

    if (!parsedOutputs) {
      subscriber.error(new Error("Failed to retrieve terraform outputs"));
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
        state: "complete",
        message: "",
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
    try {
      const stateFile = path.join(options.cwd, "terraform.tfstate");

      let app = new App({
        outdir: options.cwd,
      });
      let stack = new CldCtlTerraformStack(app, "arcctl");
      this.configureTerraformProviders(stack);
      const fileStorageDir = path.join(
        options.providerStore.storageDir,
        options.id,
      );
      Deno.mkdirSync(fileStorageDir, { recursive: true });
      const { module } = stack.addModule(this.construct, {
        id: options.id,
        FileConstruct: createProviderFileConstructor(fileStorageDir),
        accountName: this.accountName,
        credentials: this.credentials,
        providerStore: this.providerStore,
      });

      const startTime = Date.now();
      subscriber.next({
        status: {
          state: "starting",
          message: "Importing resource state",
          startTime,
        },
      });

      if (options.state && "terraform_version" in options.state) {
        Deno.writeFileSync(
          stateFile,
          new TextEncoder().encode(JSON.stringify(options.state)),
        );
      } else if (options.state) {
        // State must be imported from an ID
        const imports = await module.genImports(options.state.id);

        // We have to run this before we can run `terraform import`
        await this.tfInit(options.cwd, stack, options.logger);

        const terraform = await this.getTerraformPlugin();
        for (const [key, value] of Object.entries(imports)) {
          await terraform.import(options.cwd, key, value).status;
        }
      }

      app = new App({ outdir: options.cwd });
      stack = new CldCtlTerraformStack(app, "arcctl");
      this.configureTerraformProviders(stack);

      subscriber.next({
        status: {
          state: "starting",
          message: "Initializing terraform",
          startTime,
        },
      });

      await this.tfInit(options.cwd, stack, options.logger);

      subscriber.next({
        status: {
          state: "starting",
          message: "Generating diff",
          startTime,
        },
      });

      await this.tfPlan(options.cwd, options.logger);

      subscriber.next({
        status: {
          state: "applying",
          message: "Applying changes",
          startTime,
        },
      });

      await this.tfApply(options.cwd, options.logger);

      const stateFileBuffer = await Deno.readFile(stateFile);
      options.state = JSON.parse(new TextDecoder().decode(stateFileBuffer));

      subscriber.next({
        status: {
          state: "complete",
          message: "",
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

  public apply(
    inputs: ResourceInputs[T],
    options: ApplyOptions<TerraformResourceState>,
  ): Observable<ApplyOutputs<T>> {
    return new Observable((subscriber) => {
      this.applyAsync(subscriber, inputs, options);
    });
  }

  public destroy(
    options: ApplyOptions<TerraformResourceState>,
  ): Observable<ApplyOutputs<T>> {
    return new Observable((subscriber) => {
      this.destroyAsync(subscriber, options);
    });
  }
}
