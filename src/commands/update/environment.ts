import { BaseCommand } from '../../base-command.js';
import { CloudGraph } from '../../cloud-graph/index.js';
import { Environment, parseEnvironment } from '../../environments/index.js';
import { Pipeline } from '../../pipeline/index.js';
import { Flags } from '@oclif/core';
import cliSpinners from 'cli-spinners';
import path from 'path';
import winston, { Logger } from 'winston';

export class UpdateEnvironmentCmd extends BaseCommand {
  static description = 'Apply changes to an environment';

  static flags = {
    datacenter: Flags.string({
      char: 'd',
      description: 'New datacenter for the environment',
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
      description: 'Path to the new environment configuration file',
    },
  ];

  async run(): Promise<void> {
    const { args, flags } = await this.parse(UpdateEnvironmentCmd);

    const environmentRecord = await this.environmentStore.get(args.name);
    if (!flags.datacenter && !environmentRecord) {
      this.error(`A datacenter must be specified for new environments`);
    }

    const targetDatacenterName =
      flags.datacenter || environmentRecord?.datacenter;
    const targetDatacenter = targetDatacenterName
      ? await this.datacenterStore.get(targetDatacenterName)
      : undefined;
    if (!targetDatacenter) {
      this.error(`Couldn't find a datacenter named ${targetDatacenterName}`);
    }

    let targetEnvironment: Environment | undefined;
    let targetGraph = new CloudGraph();
    if (args.config_path) {
      targetEnvironment = await parseEnvironment(args.config_path);
      targetGraph = await targetEnvironment.getGraph(
        args.name,
        this.componentStore,
      );
    }

    targetGraph = await targetDatacenter.config.enrichGraph(
      targetGraph,
      args.name,
    );

    let startingPipeline = new Pipeline();
    if (environmentRecord?.datacenter) {
      const startingDatacenter = await this.datacenterStore.get(
        environmentRecord.datacenter,
      );
      if (startingDatacenter) {
        startingPipeline = await this.getPipelineForDatacenter(
          startingDatacenter,
        );
      }
    }

    const pipeline = Pipeline.plan({
      before: startingPipeline,
      after: targetGraph,
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
        cwd: path.resolve(path.join('./.terraform', targetDatacenter.name)),
        logger,
      })
      .then(async () => {
        await this.saveDatacenter(
          targetDatacenter.name,
          targetDatacenter.config,
          pipeline,
        );
        await this.environmentStore.save({
          name: args.name,
          datacenter: targetDatacenter.name,
          config: targetEnvironment,
        });
        this.renderPipeline(pipeline, { clear: !flags.verbose });
        clearInterval(interval);
      })
      .catch(async (err) => {
        await this.saveDatacenter(
          targetDatacenter.name,
          targetDatacenter.config,
          pipeline,
        );
        this.renderPipeline(pipeline, { clear: !flags.verbose });
        clearInterval(interval);
        this.error(err);
      });
  }
}
