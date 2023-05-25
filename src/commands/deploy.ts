import { BaseCommand } from '../base-command.js';
import EnvironmentV1 from '../environments/v1/index.js';
import { Pipeline } from '../pipeline/index.js';
import { ImageRepository } from '@architect-io/arc-oci';
import { Flags } from '@oclif/core';
import cliSpinners from 'cli-spinners';
import path from 'path';
import winston, { Logger } from 'winston';

export class DeployComponentCmd extends BaseCommand {
  static description = 'Deploy a component into an existing environment';

  static args = [
    {
      name: 'tag',
      description: 'Component tag to deploy to the environment',
      required: true,
    },
    {
      name: 'environment',
      description: 'Name of the environment to deploy to',
      required: true,
    },
  ];

  static flags = {
    ingress: Flags.string({
      char: 'i',
      description: 'Mappings of ingress rules for this component to subdomains',
      multiple: true,
    }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(DeployComponentCmd);

    try {
      const imageRepository = new ImageRepository(args.tag);
      await this.componentStore.getComponentConfig(args.tag);
      const environmentRecord = await this.environmentStore.get(
        args.environment,
      );
      if (!environmentRecord) {
        this.error(`Invalid environment name: ${args.environment}`);
      }

      const datacenterRecord = await this.datacenterStore.get(
        environmentRecord.datacenter,
      );
      if (!datacenterRecord) {
        this.error(
          `Invalid datacenter associated with environment: ${environmentRecord.datacenter}`,
        );
      }
      const previousPipeline = await this.getPipelineForDatacenter(
        datacenterRecord,
      );

      const environment =
        environmentRecord.config ||
        new EnvironmentV1({
          components: {},
        });

      const ingressRules: Record<string, string> = {};
      for (const rule of flags.ingress || []) {
        const [key, value] = rule.split(':');
        ingressRules[key] = value;
      }

      environment.addComponent({
        image: imageRepository,
        ingresses: ingressRules,
      });

      const targetGraph = await datacenterRecord.config.enrichGraph(
        await environment.getGraph(environmentRecord.name, this.componentStore),
        environmentRecord.name,
      );

      const pipeline = Pipeline.plan({
        before: previousPipeline,
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
          cwd: path.resolve('./.terraform'),
          logger,
        })
        .then(async () => {
          await this.saveDatacenter(
            datacenterRecord.name,
            datacenterRecord.config,
            pipeline,
          );
          await this.environmentStore.save({
            name: environmentRecord.name,
            datacenter: datacenterRecord.name,
            config: environment,
          });
          this.renderPipeline(pipeline, { clear: !flags.verbose });
          clearInterval(interval);
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
      this.error(err);
    }
  }
}
