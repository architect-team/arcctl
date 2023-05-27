import { BaseCommand } from '../../base-command.js';
import { CloudGraph } from '../../cloud-graph/index.js';
import { DatacenterRecord } from '../../datacenters/index.js';
import { Pipeline } from '../../pipeline/index.js';
import { Flags } from '@oclif/core';
import cliSpinners from 'cli-spinners';
import inquirer from 'inquirer';
import path from 'path';
import winston, { Logger } from 'winston';

export class DestroyDatacenterCmd extends BaseCommand {
  static description =
    'Destroy a datacenter and all the environments managed by it';

  static args = [
    {
      name: 'name',
      description: 'Name of the datacenter to destroy',
    },
  ];

  static flags = {
    verbose: Flags.boolean({
      char: 'v',
      description: 'Turn on verbose logs',
    }),
  };

  private async promptForDatacenter(name?: string): Promise<DatacenterRecord> {
    const datacenterRecords = await this.datacenterStore.find();

    if (datacenterRecords.length <= 0) {
      this.error('There are no datacenters to destroy');
    }

    const selected = datacenterRecords.find((d) => d.name === name);
    const { datacenter } = await inquirer.prompt(
      [
        {
          name: 'datacenter',
          type: 'list',
          message: 'Select a datacenter to destroy',
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
    const { args, flags } = await this.parse(DestroyDatacenterCmd);

    const datacenterRecord = await this.promptForDatacenter(args.name);
    const lastPipeline = await this.getPipelineForDatacenter(datacenterRecord);
    const pipeline = Pipeline.plan({
      before: lastPipeline,
      after: new CloudGraph(),
    });

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
        cwd: path.resolve('./.terraform'),
      })
      .then(async () => {
        await this.removeDatacenter(datacenterRecord);
        this.renderPipeline(pipeline, { clear: !flags.verbose });
        clearInterval(interval);
        this.log('Datacenter destroyed successfully');
      })
      .catch(async (err) => {
        await this.saveDatacenter(
          datacenterRecord.name,
          datacenterRecord.config,
          pipeline,
        );
        clearInterval(interval);
        this.error(err);
      });
  }
}
