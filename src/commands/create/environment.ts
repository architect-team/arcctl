import { BaseCommand } from '../../base-command.js';
import { CloudGraph } from '../../cloud-graph/index.js';
import { DatacenterRecord } from '../../datacenters/index.js';
import { Environment, parseEnvironment } from '../../environments/index.js';
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
    },
  ];

  private async promptForDatacenter(name?: string): Promise<DatacenterRecord> {
    const datacenterRecords = await this.datacenterStore.find();
    if (datacenterRecords.length <= 0) {
      this.error('No datacenters to create environments in');
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

    const existing = await this.environmentStore.get(args.name);
    if (existing) {
      this.error(`An environment named ${args.name} already exists`);
    }

    try {
      const datacenterRecord = await this.promptForDatacenter(flags.datacenter);
      const lastPipeline = await this.getPipelineForDatacenter(
        datacenterRecord,
      );

      let environment: Environment | undefined;
      let environmentGraph = new CloudGraph();
      if (args.config_path) {
        environment = await parseEnvironment(args.config_path);
        environmentGraph = await environment.getGraph(
          args.name,
          this.componentStore,
        );
      }

      const targetGraph = await datacenterRecord.config.enrichGraph(
        environmentGraph,
        args.name,
      );

      const pipeline = Pipeline.plan({
        before: lastPipeline,
        after: targetGraph,
      });

      pipeline.validate();

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
          await this.saveDatacenter(
            datacenterRecord.name,
            datacenterRecord.config,
            pipeline,
          );
          await this.environmentStore.save({
            datacenter: datacenterRecord.name,
            name: args.name,
            config: environment,
          });
          this.renderPipeline(pipeline, { clear: !flags.verbose });
          clearInterval(interval);
          this.log('Environment created successfully');
        })
        .catch(async (err) => {
          await this.saveDatacenter(
            datacenterRecord.name,
            datacenterRecord.config,
            pipeline,
          );
          this.renderPipeline(pipeline, { clear: !flags.verbose });
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
