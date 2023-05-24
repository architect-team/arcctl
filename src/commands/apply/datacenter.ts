import { BaseCommand } from '../../base-command.js';
import { CloudGraph } from '../../cloud-graph/index.js';
import { parseDatacenter } from '../../datacenters/index.js';
import { Pipeline } from '../../pipeline/index.js';
import { Flags } from '@oclif/core';
import cliSpinners from 'cli-spinners';
import winston, { Logger } from 'winston';

export default class ApplyDatacenterChangesCmd extends BaseCommand {
  static description = 'Apply changes to a new or existing datacenter';

  static flags = {
    name: Flags.string({
      char: 'n',
      description: `Name of the datacenter to modify. If it doesn't exist, one will be created.`,
      required: true,
    }),

    verbose: Flags.boolean({
      char: 'v',
      description: 'Turn on verbose logs',
    }),
  };

  static args = [
    {
      name: 'config_path',
      description: 'Path to the new datacenter configuration file',
      required: true,
    },
  ];

  async run(): Promise<void> {
    const { args, flags } = await this.parse(ApplyDatacenterChangesCmd);

    try {
      const currentDatacenterRecord = await this.datacenterStore.get(
        flags.name,
      );
      const newDatacenter = await parseDatacenter(args.config_path);
      const allEnvironments = await this.environmentStore.getEnvironments();
      const datacenterEnvironments = allEnvironments.filter(
        (e) => e.datacenter === flags.name,
      );

      const targetGraph = await newDatacenter.enrichGraph(new CloudGraph());

      for (const record of datacenterEnvironments) {
        const originalEnvGraph = await record.config?.getGraph(
          record.name,
          this.componentStore,
        );
        const targetEnvGraph = await newDatacenter.enrichGraph(
          originalEnvGraph || new CloudGraph(),
          record.name,
        );

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
        this.log('Datacenter created successfully');
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
        })
        .then(async () => {
          await this.saveDatacenter(args.name, newDatacenter, newPipeline);
          this.renderPipeline(newPipeline, { clear: !flags.verbose });
          clearInterval(interval);
          this.log('Datacenter created successfully');
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
