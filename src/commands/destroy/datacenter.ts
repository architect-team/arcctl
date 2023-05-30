import { BaseCommand } from '../../base-command.ts';
import { CloudGraph } from '../../cloud-graph/index.ts';
import { DatacenterRecord } from '../../datacenters/index.ts';
import { Pipeline } from '../../pipeline/index.ts';
import { Flags } from '@oclif/core';
import cliSpinners from 'cli-spinners';
import inquirer from 'inquirer';
import * as path from 'std/path/mod.ts';
import winston, { Logger } from 'winston';

export class DestroyDatacenterCmd extends BaseCommand {
  static description = 'Destroy a datacenter and all the environments managed by it';

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

    'auto-approve': Flags.boolean({
      description: 'Skip all prompts and start the requested action',
      default: false,
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

    const allEnvs = await this.environmentStore.find();
    const datacenterEnvs = allEnvs.filter((env) => env.datacenter === datacenterRecord.name);

    if (datacenterEnvs.length > 0) {
      this.log('This will also destroy all the following environments:');
      for (const env of datacenterEnvs) {
        this.log(`- ${env.name}`);
      }

      const { confirm } = await inquirer.prompt(
        [
          {
            name: 'confirm',
            type: 'confirm',
            message: 'Are you sure you want to proceed?',
          },
        ],
        { confirm: flags['auto-approve'] === true || undefined },
      );

      if (!confirm) {
        this.error('Datacenter destruction cancelled');
      }
    }

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
        // Remove all the environments backed by this datacenter
        for (const env of datacenterEnvs) {
          await this.environmentStore.remove(env.name);
        }

        await this.removeDatacenter(datacenterRecord);
        this.renderPipeline(pipeline, { clear: !flags.verbose });
        clearInterval(interval);
        this.log('Datacenter destroyed successfully');
      })
      .catch(async (err) => {
        await this.saveDatacenter(datacenterRecord.name, datacenterRecord.config, pipeline);
        clearInterval(interval);
        this.error(err);
      });
  }
}
