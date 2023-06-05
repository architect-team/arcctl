import { ResourceType, ResourceTypeList } from '../../@resources/index.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from '../base-command.ts';
import { CloudGraph } from '../../cloud-graph/index.ts';
import { Pipeline } from '../../pipeline/index.ts';
import { Terraform } from '../../terraform/terraform.ts';
import CloudCtlConfig from '../../utils/config.ts';
import cliSpinners from 'cli-spinners';
import winston, { Logger } from 'winston';
import { EnumType } from 'cliffy/command/mod.ts';
import { colors } from 'cliffy/ansi/colors.ts';
import * as path from 'std/path/mod.ts';
import { Confirm } from 'cliffy/prompt/mod.ts';

const resourceType = new EnumType(ResourceTypeList);

type CreateResourceOptions = {
  account?: string;
  inputs?: string;
  verbose?: boolean;
} & GlobalOptions;

const CreateResourceCommand = BaseCommand()
  .description('Create a new cloud resource')
  .type('resourceType', resourceType)
  .option('-a, --account <account:string>', 'The cloud provider credentials to use to apply this resource')
  .option('-v, --verbose', 'Show verbose logs of the command')
  .arguments('[type:resourceType]')
  .action(create_resource_action);

async function create_resource_action(options: CreateResourceOptions, resource_type?: ResourceType) {
  const command_helper = new CommandHelper(options);

  if (resource_type) {
    const is_creatable_type = await command_helper.isCreatableResourceType(resource_type);
    if (!is_creatable_type) {
      console.error(`Creation of ${resource_type} resources is not supported`);
      Deno.exit(1);
    }
  }

  const account = await command_helper.promptForAccount({
    account: options.account,
    type: resource_type,
    action: 'create',
  });

  const type = await command_helper.promptForResourceType(account, 'create', resource_type);

  const graph = new CloudGraph();
  const rootNode = await command_helper.promptForNewResource(graph, account, type);

  const pipeline = Pipeline.plan({
    before: new Pipeline(),
    after: graph,
  });

  console.log('\nAbout to create the following resources:');
  command_helper.renderPipeline(pipeline);
  console.log('');
  const proceed = await Confirm.prompt('Do you want to proceed?');

  if (!proceed) {
    console.log(`${type} creation cancelled`);
    Deno.exit(0);
  }

  let interval: number;
  if (!options.verbose) {
    interval = setInterval(() => {
      command_helper.renderPipeline(pipeline, { clear: true });
    }, 1000 / cliSpinners.dots.frames.length);
  }

  let logger: Logger | undefined;
  if (options.verbose) {
    command_helper.renderPipeline(pipeline);
    logger = winston.createLogger({
      level: 'info',
      format: winston.format.printf(({ message }) => message),
      transports: [new winston.transports.Console()],
    });
  }

  return pipeline
    .apply({
      providerStore: command_helper.providerStore,
      logger: logger,
      cwd: path.resolve('./.terraform'),
    })
    .then(async () => {
      command_helper.renderPipeline(pipeline, { clear: true });
      clearInterval(interval);
      const step = pipeline.steps.find((s) => s.type === rootNode.type && s.name === rootNode.name);
      const terraform = await Terraform.generate(CloudCtlConfig.getPluginDirectory(), '1.4.5');
      const outputs = await step?.getOutputs({
        providerStore: command_helper.providerStore,
        terraform,
      });
      console.log('');
      console.log(colors.green(`${type} created successfully!`));
      console.log('Please record the results for your records. Some fields may not be retrievable again.');
      console.log(outputs);
    })
    .catch((err) => {
      clearInterval(interval);
      console.error(err);
      Deno.exit(1);
    });
}

export default CreateResourceCommand;
