import { ResourceOutputs, ResourceType } from '../../@resources/types.js';
import { BaseCommand } from '../../base-command.js';
import { PipelineStep, StepStatus } from '../../pipeline/index.js';
import CloudCtlConfig from '../../utils/config.js';
import { CldCtlTerraformStack } from '../../utils/stack.js';
import TaskManager from '../../utils/task-manager.js';
import Terraform from '../../utils/terraform.js';
import { Flags } from '@oclif/core';
import { App } from 'cdktf';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { BehaviorSubject, Observable, Subscriber } from 'rxjs';

export default class DeleteResourceCommand extends BaseCommand {
  static description = 'Delete a cloud resource';

  static flags = {
    account: Flags.string({
      char: 'a',
      description: 'The cloud provider account to use to destroy this resource',
    }),
  };

  static args = [
    {
      name: 'type',
      description: 'The name of the resource type to list',
      type: 'string',
    },
    {
      name: 'id',
      description: 'Unique ID of the resource to delete',
      type: 'string',
    },
  ];

  async run(): Promise<void> {
    const { args, flags } = await this.parse(DeleteResourceCommand);

    if (args.type) {
      const is_creatable_type = await this.isCreatableResourceType(args.type);
      if (!is_creatable_type) {
        this.error(`Deletion of ${args.type} resources is not supported`);
      }
    }

    const provider = await this.promptForAccount({
      account: flags.account,
      type: args.type,
      action: 'delete',
    });

    const type = await this.promptForResourceType(
      provider,
      'delete',
      args.type,
    );

    const service = provider.resources[type];
    if (!service) {
      this.error(
        `The ${provider.type} provider doesn't support ${type} resources`,
      );
    }

    let choices: any[] = [];
    if (service.list) {
      const res = await service.list();
      choices = res.rows.map((row) => ({
        name: (row as any).name ? `${(row as any).name} (${row.id})` : row.id,
        value: row.id,
      }));
    }

    if (choices.length === 0) {
      this.log(chalk.yellow('No resources were found'));
      this.exit(0);
    }

    const { id } = await inquirer.prompt<{ id: string }>(
      [
        {
          name: 'id',
          type: 'list',
          message: `Which ${type} resource should be deleted?`,
          choices,
        },
      ],
      { id: args.id },
    );

    const { proceed } = await inquirer.prompt([
      {
        name: 'proceed',
        type: 'confirm',
        message: `Are you sure you would like to delete this resource? Don't interrupt the process once it starts!`,
      },
    ]);

    if (!proceed) {
      this.exit(0);
    }

    const app = new App({
      outdir: CloudCtlConfig.getTerraformDirectory(),
    });
    const stack = new CldCtlTerraformStack(app, 'cldctl');
    provider.configureTerraformProviders(stack);
    const module = new ModuleConstructor(stack, type, {} as any);

    const taskManager = new TaskManager([
      {
        title:
          'Deleting your resources (this can take a while depending on the resource type)...',
        finished: false,
        action: () => {
          const subject = new BehaviorSubject<
            ResourceOutputs[ResourceType] | StepStatus
          >({
            state: 'pending',
          });

          const fn = async () => {
            subject.next({
              state: 'initializing',
              message: 'Getting everything ready',
            });

            try {
              await Terraform.destroy(
                module,
                provider.terraform_version,
                stack,
                {
                  [type as ResourceType]: {
                    id: id,
                    credentials: provider.credentials,
                  },
                },
                subject,
              );
            } catch (err) {
              this.handleTerraformError(err);
            }

            if (module.hooks?.afterDelete) {
              await module.hooks.afterDelete();
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
                if (res.state === 'deleting') {
                  taskManager.add({
                    title: `Deleting: ${key}`,
                    action: () =>
                      new Observable((observer) => {
                        terraformSubscribers[key] = observer;
                      }),
                    finished: false,
                  });
                } else if (res.state === 'complete') {
                  terraformSubscribers[key]?.complete();
                }
              }
            },
            error: (err: any) => {
              subject.error(err);
            },
            complete: () => {
              subject.complete();
            },
          });

          return subject.asObservable();
        },
      },
    ]);

    console.time('Time');
    await taskManager.run();
    this.log(chalk.green(`${type} resource deleted successfully`));
    console.timeEnd('Time');
  }
}
