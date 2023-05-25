import { ResourceOutputs, ResourceType } from '../../@resources/types.ts';
import { BaseCommand } from '../../base-command.ts';
import CloudCtlConfig from '../../utils/config.ts';
import { CldCtlTerraformStack } from '../../utils/stack.ts';
import TaskManager from '../../utils/task-manager.ts';
import Terraform from '../../utils/terraform.ts';
import { Flags } from '@oclif/core';
import { ResourceStatus } from '@providers/status.ts';
import { App } from 'cdktf';
import chalk from 'chalk';
import { colors } from 'cliffy/ansi/colors.ts';
import inquirer from 'inquirer';
import { BehaviorSubject, Observable, Subscriber } from 'rxjs';

export default class DeleteResourceCommand extends BaseCommand {
  static description = 'Delete a cloud resource';
  static displayName = 'delete';

  static flags = {
    credentials: Flags.string({
      char: 'c',
      description:
        'The cloud provider credentials to use to apply this resource',
    }),
    dev: Flags.boolean({
      description: 'When enabled no actual terraform is applied',
      default: false,
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

    CloudCtlConfig.setDev(flags.dev);

    if (args.type) {
      const is_creatable_type = await this.isCreatableResourceType(args.type);
      if (!is_creatable_type) {
        this.error(`Deletion of ${args.type} resources is not supported`);
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
        `The ${provider.type} provider doesn't support ${type} resources`,
      );
    }

    const ModuleConstructor = service.manage?.module;
    if (!ModuleConstructor) {
      this.error(
        `The ${provider.type} provider can't delete ${type} resources`,
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
      this.log(colors.yellow('No resources were found'));
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
    this.log(colors.green(`${type} resource deleted successfully`));
    console.timeEnd('Time');
  }
}
