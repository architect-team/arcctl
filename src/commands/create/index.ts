import {
  ResourceOutputs,
  ResourceType,
  ResourceTypeList,
} from '../../@resources/index.ts';
import { BaseCommand } from '../../base-command.ts';
import CloudCtlConfig from '../../utils/config.ts';
import { CldCtlTerraformStack } from '../../utils/stack.ts';
import TaskManager from '../../utils/task-manager.ts';
import Terraform from '../../utils/terraform.ts';
import { Flags } from '@oclif/core';
import { ResourceModule } from '@providers/module.ts';
import { ResourceStatus } from '@providers/status.ts';
import { App } from 'npm:cdktf';
import chalk from 'chalk';
import * as fs from 'fs';
import inquirer from 'inquirer';
import { BehaviorSubject, Observable, Subscriber } from 'rxjs';
import { inspect } from 'util';

export default class CreateResourceCommand extends BaseCommand {
  static description = 'Create a new cloud resource';

  static flags = {
    credentials: Flags.string({
      char: 'c',
      description:
        'The cloud provider credentials to use to apply this resource',
    }),
    inputs: Flags.string({
      char: 'i',
      description:
        'A yaml file that represents the answers to some or all of the input questions',
    }),
    'no-cleanup': Flags.boolean({
      description: 'When enabled the terraform files are not deleted',
      default: false,
      hidden: true,
    }),
    dev: Flags.boolean({
      description: 'When enabled no actual terraform is applied',
      default: false,
      hidden: true,
    }),
  };

  static args = [
    {
      name: 'type',
      description: 'The name of the resource type to create',
      type: 'enum',
      options: ResourceTypeList,
    },
  ];

  async run(): Promise<void> {
    const { args, flags } = await this.parse(CreateResourceCommand);

    CloudCtlConfig.setDev(flags.dev);
    CloudCtlConfig.setNoCleanup(flags['no-cleanup']);

    if (args.type) {
      const is_creatable_type = await this.isCreatableResourceType(args.type);
      if (!is_creatable_type) {
        this.error(`Creation of ${args.type} resources is not supported`);
      }
    }

    const provider = await this.promptForProvider({
      provider: flags.credentials,
      type: args.type,
      action: 'manage',
    });

    const type = await this.promptForResourceType(
      provider,
      'manage',
      args.type,
    );

    const service = provider.resources[type];
    if (!service) {
      this.error(
        `The ${provider.type} provider cannot create the ${type} resource`,
      );
    }

    await fs.promises.mkdir(CloudCtlConfig.getTerraformDirectory(), {
      recursive: true,
    });
    const app = new App({
      outdir: CloudCtlConfig.getTerraformDirectory(),
    });
    const stack = new CldCtlTerraformStack(app, 'cldctl');
    provider.configureTerraformProviders(stack);
    const { module, output: tfOutput } = await this.promptForNewResourceModule(
      stack,
      provider,
      type,
    );

    const inputs = module.inputs as any;
    for (const key of Object.keys(inputs)) {
      const child = stack.node.tryFindChild(key);
      if (ResourceTypeList.includes(key as ResourceType) && child) {
        inputs[key] = (child as ResourceModule<any, any>).inputs;
      }
    }

    this.log('\nAbout to create the following resource:');
    this.log(inputs);
    const { proceed } = await inquirer.prompt([
      {
        name: 'proceed',
        type: 'confirm',
        message: 'Do you want to proceed?',
      },
    ]);

    if (!proceed) {
      this.log(`${type} creation cancelled`);
      this.exit(0);
    }

    let outputs: ResourceOutputs[ResourceType] | undefined;

    const taskManager = new TaskManager([
      {
        title:
          'Creating your resources (this can take a while depending on the resource type)...',
        finished: false,
        action: () => {
          const subject = new BehaviorSubject<
            ResourceOutputs[ResourceType] | ResourceStatus
          >({
            state: 'pending',
          });

          const fn = async () => {
            subject.next({
              state: 'initializing',
              message: 'Getting everything ready',
            });

            try {
              await Terraform.upsert(
                provider.terraform_version,
                stack,
                subject,
              );
            } catch (err) {
              this.handleTerraformError(err);
            }

            outputs = await Terraform.getOutput(tfOutput);
            if (module.hooks?.afterCreate) {
              await module.hooks.afterCreate();
            }
            await Terraform.cleanup();
            subject.complete();
          };
          fn();

          const subscriber = subject.asObservable();

          const terraformSubscribers: {
            [key: string]: Subscriber<ResourceStatus>;
          } = {};
          subscriber.subscribe({
            next: (res: ResourceOutputs[ResourceType] | ResourceStatus) => {
              if ('state' in res) {
                const key = res.message as string;
                if (res.state === 'creating') {
                  taskManager.add({
                    title: `Creating: ${key}`,
                    action: () =>
                      new Observable((observer) => {
                        terraformSubscribers[key] = observer;
                      }),
                    finished: false,
                  });
                } else if (res.state === 'complete') {
                  terraformSubscribers[key]?.complete();
                }
              } else {
                outputs = res;
              }
            },
            error: (err: any) => {
              subject.error(err);
            },
            complete: () => {
              subject.complete();
            },
          });

          return subscriber;
        },
      },
    ]);

    console.time('Time');
    await taskManager.run();
    this.log(inspect(outputs));
    this.log(chalk.green(`${type} resource created successfully`));
    console.timeEnd('Time');
  }
}
