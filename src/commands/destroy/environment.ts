import { BaseCommand } from '../../base-command.js';
import { CloudGraph } from '../../cloud-graph/index.js';
import { EnvironmentRecord } from '../../environments/index.js';
import { Pipeline } from '../../pipeline/index.js';
import { Flags } from '@oclif/core';
import cliSpinners from 'cli-spinners';
import inquirer from 'inquirer';
import path from 'path';
import winston, { Logger } from 'winston';

export class DestroyEnvironmentCmd extends BaseCommand {
  static description = 'Destroy all the resources in the specified environment';

  static args = [
    {
      name: 'name',
      description: 'Name of the environment to destroy',
    },
  ];

  static flags = {
    verbose: Flags.boolean({
      char: 'v',
      description: 'Turn on verbose logs',
    }),
  };

  private async promptForEnvironment(
    name?: string,
  ): Promise<EnvironmentRecord> {
    const environmentRecords = await this.environmentStore.find();

    if (environmentRecords.length <= 0) {
      this.error('There are no environments to destroy');
    }

    const selected = environmentRecords.find((r) => r.name === name);
    const { environment } = await inquirer.prompt(
      [
        {
          name: 'environment',
          type: 'list',
          message: 'Select an environment to destroy',
          choices: environmentRecords.map((r) => ({
            name: r.name,
            value: r,
          })),
        },
      ],
      { environment: selected },
    );

    return environment;
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(DestroyEnvironmentCmd);

    const environmentRecord = await this.promptForEnvironment(args.name);
    const datacenterRecord = await this.datacenterStore.get(
      environmentRecord.datacenter,
    );
    if (!datacenterRecord) {
      const { confirm } = await inquirer.prompt([
        {
          name: 'confirm',
          type: 'confirm',
          message: `The environment is pointed to an invalid datacenter. The environment can be removed, but the resources can't be destroyed. Would you like to proceed?`,
        },
      ]);

      if (confirm) {
        await this.environmentStore.remove(environmentRecord.name);
        this.log(`Environment removed. Resources may still be dangling.`);
        return;
      } else {
        this.log('Environment removal cancelled.');
        return;
      }
    }

    const lastPipeline = await this.getPipelineForDatacenter(datacenterRecord);

    const targetGraph = await datacenterRecord?.config.enrichGraph(
      new CloudGraph(),
    );
    const pipeline = Pipeline.plan({
      before: lastPipeline,
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
        logger: logger,
        cwd: path.resolve('./.terraform'),
      })
      .then(async () => {
        await this.saveDatacenter(
          datacenterRecord.name,
          datacenterRecord.config,
          pipeline,
        );
        await this.environmentStore.remove(environmentRecord.name);
        this.renderPipeline(pipeline, { clear: !flags.verbose });
        clearInterval(interval);
        this.log('Environment destroyed successfully');
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
