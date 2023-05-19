import { BaseCommand } from '../../base-command.js';
import { parseEnvironment } from '../../environments/index.js';
import { ExecutableGraph } from '../../executable-graph/index.js';
import { Flags } from '@oclif/core';
import cliSpinners from 'cli-spinners';
import path from 'path';
import winston, { Logger } from 'winston';

export class ApplyEnvironmentChangesCmd extends BaseCommand {
  static description = 'Apply changes to an environment';

  static flags = {
    name: Flags.string({
      char: 'n',
      description: `Name of the environment to modify. If it doesn't exist, it will be created.`,
      required: true,
    }),

    datacenter: Flags.string({
      char: 'd',
      description: 'Name of the datacenter backing the environment',
    }),

    verbose: Flags.boolean({
      char: 'v',
      description: 'Turn on verbose logs',
    }),
  };

  static args = [
    {
      name: 'config_path',
      description: 'Path to the new environment configuration file',
      required: true,
    },
  ];

  async run(): Promise<void> {
    const { args, flags } = await this.parse(ApplyEnvironmentChangesCmd);

    try {
      const environmentRecord = await this.environmentStore.getEnvironment(
        flags.name,
      );
      const newEnvironmentConfig = await parseEnvironment(args.config_path);
      if (!flags.datacenter && !environmentRecord) {
        this.error(`A datacenter must be specified for new environments`);
      }

      const datacenterName = flags.datacenter || environmentRecord?.datacenter;
      const newDatacenter = datacenterName
        ? await this.datacenterStore.getDatacenter(datacenterName)
        : undefined;
      if (!newDatacenter) {
        this.error(
          `Couldn't find a datacenter named ${
            flags.datacenter || environmentRecord?.datacenter
          }`,
        );
      }

      let newGraph = await newEnvironmentConfig.getGraph(
        flags.name,
        this.componentStore,
      );
      newGraph = await newDatacenter.config.enrichGraph(newGraph, flags.name);

      const graphPlan = ExecutableGraph.plan({
        before: environmentRecord?.graph || new ExecutableGraph(),
        after: newGraph,
        datacenter: datacenterName!,
      });

      let interval: NodeJS.Timer;
      if (!flags.verbose) {
        interval = setInterval(() => {
          this.renderGraph(graphPlan);
        }, 1000 / cliSpinners.dots.frames.length);
      }

      let logger: Logger | undefined;
      if (flags.verbose) {
        logger = winston.createLogger({
          level: 'info',
          format: winston.format.printf(({ message }) => message),
          transports: [new winston.transports.Console()],
        });
      }

      return graphPlan
        .apply({
          datacenterStore: this.datacenterStore,
          providerStore: this.providerStore,
          cwd: path.resolve('./.terraform'),
          logger,
        })
        .then(async () => {
          await this.environmentStore.saveEnvironment({
            datacenter: datacenterName!,
            graph: graphPlan,
            name: flags.name,
            config: newEnvironmentConfig,
          });
          this.renderGraph(graphPlan);
          clearInterval(interval);
        })
        .catch((err) => {
          clearInterval(interval);
          this.error(err);
        });
    } catch (err: any) {
      if (Array.isArray(err)) {
        err.map((e) => {
          this.log(e);
        });
      }
    }
  }
}
