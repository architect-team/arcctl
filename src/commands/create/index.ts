import { ResourceTypeList } from '../../@resources/index.ts';
import { BaseCommand } from '../../base-command.ts';
import { CloudGraph } from '../../cloud-graph/index.ts';
import { Pipeline } from '../../pipeline/index.ts';
import { Terraform } from '../../terraform/terraform.ts';
import CloudCtlConfig from '../../utils/config.ts';
import { Flags } from '@oclif/core';
import cliSpinners from 'cli-spinners';
import inquirer from 'inquirer';
import { inspect } from 'node:util';
import winston, { Logger } from 'winston';

export default class CreateResourceCommand extends BaseCommand {
  static description = 'Create a new cloud resource';

  static flags = {
    account: Flags.string({
      char: 'a',
      description: 'The cloud provider credentials to use to apply this resource',
    }),

    inputs: Flags.string({
      char: 'i',
      description: 'A yaml file that represents the answers to some or all of the input questions',
    }),

    verbose: Flags.boolean({
      char: 'v',
      description: 'Turn on verbose logs',
    }),
  };

  static args = [
    {
      name: 'type',
      description: 'The name of the resource type to create',
      type: 'enum',
      options: ResourceTypeList,
    },
  ];

  async run(): Promise<void> {
    const { args, flags } = await this.parse(CreateResourceCommand);

    if (args.type) {
      const is_creatable_type = await this.isCreatableResourceType(args.type);
      if (!is_creatable_type) {
        this.error(`Creation of ${args.type} resources is not supported`);
      }
    }

    const account = await this.promptForAccount({
      account: flags.account,
      type: args.type,
      action: 'create',
    });

    const type = await this.promptForResourceType(account, 'create', args.type);

    const graph = new CloudGraph();
    const rootNode = await this.promptForNewResource(graph, account, type);

    const pipeline = Pipeline.plan({
      before: new Pipeline(),
      after: graph,
    });

    this.log('\nAbout to create the following resources:');
    this.renderPipeline(pipeline);
    this.log('');
    const { proceed } = await inquirer.prompt([
      {
        name: 'proceed',
        type: 'confirm',
        message: 'Do you want to proceed?',
      },
    ]);

    if (!proceed) {
      this.log(`${type} creation cancelled`);
      this.exit(0);
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
      })
      .then(async () => {
        this.renderPipeline(pipeline, { clear: true });
        clearInterval(interval);
        const step = pipeline.steps.find((s) => s.type === rootNode.type && s.name === rootNode.name);
        const terraform = await Terraform.generate(CloudCtlConfig.getPluginDirectory(), '1.4.5');
        const outputs = await step?.getOutputs({
          providerStore: this.providerStore,
          terraform,
        });
        this.log('');
        this.log(chalk.green(`${type} created successfully!`));
        this.log('Please record the results for your records. Some fields may not be retrievable again.');
        this.log(inspect(outputs));
      })
      .catch((err) => {
        clearInterval(interval);
        this.error(err);
      });
  }
}
