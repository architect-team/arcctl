import { BaseCommand } from '../../base-command.ts';
import { CloudGraph } from '../../cloud-graph/index.ts';
import { parseDatacenter } from '../../datacenters/index.ts';
import { Pipeline } from '../../pipeline/index.ts';
import { Flags } from '@oclif/core';
import cliSpinners from 'cli-spinners';
import path from 'path';
import winston, { Logger } from 'winston';

export default class UpdateDatacenterCmd extends BaseCommand {
  static description = 'Apply changes to a new or existing datacenter';

  static flags = {
    verbose: Flags.boolean({
      char: 'v',
      description: 'Turn on verbose logs',
    }),
  };

  static args = [
    {
      name: 'name',
      description: 'Name of the datacenter to create or modify',
      required: true,
    },
    {
      name: 'config_path',
      description: 'Path to the new datacenter configuration file',
      required: true,
    },
  ];

  async run(): Promise<void> {
    const { args, flags } = await this.parse(UpdateDatacenterCmd);

    try {
      const currentDatacenterRecord = await this.datacenterStore.get(args.name);
      const newDatacenter = await parseDatacenter(args.config_path);
      const allEnvironments = await this.environmentStore.find();
      const datacenterEnvironments = allEnvironments.filter((e) => e.datacenter === args.name);

      const targetGraph = await newDatacenter.enrichGraph(new CloudGraph());

      for (const record of datacenterEnvironments) {
        const originalEnvGraph = await record.config?.getGraph(record.name, this.componentStore);
        const targetEnvGraph = await newDatacenter.enrichGraph(originalEnvGraph || new CloudGraph(), record.name);

        targetGraph.insertNodes(...targetEnvGraph.nodes);
        targetGraph.insertEdges(...targetEnvGraph.edges);
      }

      targetGraph.validate();

      const originalPipeline = currentDatacenterRecord
        ? await this.getPipelineForDatacenter(currentDatacenterRecord)
        : new Pipeline();

      const newPipeline = Pipeline.plan({
        before: originalPipeline,
        after: targetGraph,
      });

      if (newPipeline.steps.length <= 0) {
        await this.saveDatacenter(args.name, newDatacenter, newPipeline);
        this.log('Datacenter updated successfully');
      }

      let interval: NodeJS.Timer;
      if (!flags.verbose) {
        interval = setInterval(() => {
          this.renderPipeline(newPipeline, { clear: true });
        }, 1000 / cliSpinners.dots.frames.length);
      }

      let logger: Logger | undefined;
      if (flags.verbose) {
        this.renderPipeline(newPipeline);
        logger = winston.createLogger({
          level: 'info',
          format: winston.format.printf(({ message }) => message),
          transports: [new winston.transports.Console()],
        });
      }

      return newPipeline
        .apply({
          providerStore: this.providerStore,
          logger: logger,
          cwd: path.resolve(path.join('./.terraform', args.name)),
        })
        .then(async () => {
          await this.saveDatacenter(args.name, newDatacenter, newPipeline);
          this.renderPipeline(newPipeline, { clear: !flags.verbose });
          clearInterval(interval);
          this.log('Datacenter updated successfully');
        })
        .catch(async (err) => {
          await this.saveDatacenter(args.name, newDatacenter, newPipeline);
          clearInterval(interval);
          this.error(err);
        });
    } catch (err: any) {
      if (Array.isArray(err)) {
        err.map((e) => {
          this.log(e);
        });
      } else {
        this.error(err);
      }
    }
  }
}
