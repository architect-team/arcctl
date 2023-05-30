import { BaseCommand } from '../../base-command.ts';
import { CloudGraph } from '../../cloud-graph/index.ts';
import { parseDatacenter } from '../../datacenters/index.ts';
import { Pipeline } from '../../pipeline/index.ts';
import { Flags } from '@oclif/core';
import cliSpinners from 'cli-spinners';
import path from 'path';
import winston, { Logger } from 'winston';

export class CreateDatacenterCmd extends BaseCommand {
  static description = 'Create a new datacenter';

  static flags = {
    verbose: Flags.boolean({
      char: 'v',
      description: 'Turn on verbose logs',
    }),
  };

  static args = [
    {
      name: 'name',
      description: 'Name of the new datacenter',
      required: true,
    },
    {
      name: 'config_path',
      description: 'Path to the datacenter config file',
      required: true,
    },
  ];

  async run(): Promise<void> {
    const { args, flags } = await this.parse(CreateDatacenterCmd);

    const existingDatacenter = await this.datacenterStore.get(args.name);
    if (existingDatacenter) {
      this.error(`A datacenter named ${args.name} already exists`);
    }

    try {
      const datacenter = await parseDatacenter(args.config_path);
      const graph = await datacenter.enrichGraph(new CloudGraph());
      const pipeline = Pipeline.plan({
        before: new Pipeline(),
        after: graph,
      });

      pipeline.validate();

      if (pipeline.steps.length <= 0) {
        await this.saveDatacenter(args.name, datacenter, pipeline);
        this.log('Datacenter created successfully');
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
          cwd: path.resolve(path.join('./.terraform', args.name)),
        })
        .then(async () => {
          await this.saveDatacenter(args.name, datacenter, pipeline);
          this.renderPipeline(pipeline, { clear: !flags.verbose });
          clearInterval(interval);
          this.log('Datacenter created successfully');
        })
        .catch(async (err) => {
          await this.saveDatacenter(args.name, datacenter, pipeline);
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
