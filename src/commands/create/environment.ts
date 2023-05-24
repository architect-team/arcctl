import { BaseCommand } from '../../base-command.js';
import { CloudGraph } from '../../cloud-graph/index.js';
import { DatacenterRecord } from '../../datacenters/index.js';
import { Pipeline } from '../../pipeline/index.js';
import { Flags } from '@oclif/core';
import cliSpinners from 'cli-spinners';
import inquirer from 'inquirer';
import winston, { Logger } from 'winston';

export class CreateEnvironmentCmd extends BaseCommand {
  static description = 'Create a new environment';

  static flags = {
    datacenter: Flags.string({
      char: 'd',
      description: 'Name of the datacenter to create the environment on',
    }),

    verbose: Flags.boolean({
      char: 'v',
      description: 'Turn on verbose logs',
    }),
  };

  static args = [
    {
      name: 'name',
      description: 'Name of the new environment',
      required: true,
    },
    {
      name: 'config_path',
      description: 'Path to the environment config file',
      required: true,
    },
  ];

  private async promptForDatacenter(name?: string): Promise<DatacenterRecord> {
    const datacenterRecords = await this.datacenterStore.find();
    if (datacenterRecords.length <= 0) {
      this.error('No datacenters to create environments on');
    }

    const selected = datacenterRecords.find((d) => d.name === name);
    const { datacenter } = await inquirer.prompt(
      [
        {
          name: 'datacenter',
          type: 'list',
          message: 'Select a datacenter to host the environment',
          choices: datacenterRecords.map((r) => ({
            name: r.name,
            value: r,
          })),
        },
      ],
      { datacenter: selected },
    );

    return datacenter;
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(CreateEnvironmentCmd);

    const datacenterRecord = await this.promptForDatacenter(flags.datacenter);
    const account = this.providerStore.getProvider(
      datacenterRecord.lastPipeline.account,
    );
    if (!account) {
      this.error(
        `Invalid account, ${datacenterRecord.lastPipeline.account} associated with the datacenter: ${datacenterRecord.name}`,
      );
    }

    if (!account.resources.secret) {
      this.error(`The ${account.type} provider cannot manage secrets`);
    }

    const secret = await account.resources.secret.get(
      datacenterRecord.lastPipeline.secret,
    );
    if (!secret) {
      this.error(
        `Invalid pipeline referenced by secret: ${datacenterRecord.lastPipeline.secret}`,
      );
    }

    const lastPipeline = new Pipeline(JSON.parse(secret.data));

    try {
      const targetGraph = await datacenterRecord.config.enrichGraph(
        new CloudGraph(),
        args.name,
      );
      const pipeline = Pipeline.plan({
        before: lastPipeline,
        after: targetGraph,
      });

      pipeline.validate();

      if (pipeline.steps.length <= 0) {
        this.log('Datacenter created successfully');
        return;
      }

      let interval: NodeJS.Timer;
      if (!flags.verbose) {
        interval = setInterval(() => {
          this.renderPipeline(pipeline);
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
          await this.datacenterStore.saveDatacenter({
            name: args.name,
            config: datacenter,
          });

          this.renderPipeline(pipeline);
          clearInterval(interval);
          this.log('Datacenter created successfully');
        })
        .catch((err) => {
          clearInterval(interval);
          this.error(err);
        });
    } catch (err: any) {
      if (Array.isArray(err)) {
        for (const e of err) {
          this.log(e);
        }
      } else {
        this.error(err);
      }
    }
  }
}
