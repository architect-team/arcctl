import { BaseCommand } from '../../base-command.ts';
import { Pipeline, PipelineStep } from '../../pipeline/index.ts';
import { Flags } from '@oclif/core';
import chalk from 'chalk';
import cliSpinners from 'cli-spinners';
import inquirer from 'inquirer';
import winston, { Logger } from 'winston';

export default class DestroyResourceCommand extends BaseCommand {
  static description = 'Destroy a cloud resource';

  static flags = {
    account: Flags.string({
      char: 'a',
      description: 'The cloud account to use to destroy this resource',
    }),

    verbose: Flags.boolean({
      char: 'v',
      description: 'Turn on verbose logs',
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
    const { args, flags } = await this.parse(DestroyResourceCommand);

    if (args.type) {
      const is_creatable_type = await this.isCreatableResourceType(args.type);
      if (!is_creatable_type) {
        this.error(`Deletion of ${args.type} resources is not supported`);
      }
    }

    const account = await this.promptForAccount({
      account: flags.account,
      type: args.type,
      action: 'delete',
    });

    const type = await this.promptForResourceType(account, 'delete', args.type);

    const service = account.resources[type];
    if (!service) {
      this.error(`The ${account.type} provider doesn't support ${type} resources`);
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

    const step = new PipelineStep({
      action: 'delete',
      name: type,
      type: type,
      resource: {
        account: account.name,
        id,
      },
    });

    const pipeline = new Pipeline({ steps: [step] });

    let interval: NodeJS.Timer;
    if (!flags.verbose) {
      interval = setInterval(() => {
        this.renderPipeline(pipeline, { clear: true });
      }, 1000 / cliSpinners.dots.frames.length);
    }

    let logger: Logger | undefined;
    if (flags.verbose) {
      this.renderPipeline(pipeline);
      logger = winston.createLogger({
        level: 'info',
        format: winston.format.printf(({ message }) => message),
        transports: [new winston.transports.Console()],
      });
    }

    return pipeline
      .apply({
        providerStore: this.providerStore,
        logger: logger,
      })
      .then(async () => {
        this.renderPipeline(pipeline, { clear: true });
        clearInterval(interval);
        this.log('');
        this.log(chalk.green(`${type} destroyed successfully!`));
      })
      .catch((err) => {
        clearInterval(interval);
        this.error(err);
      });
  }
}
