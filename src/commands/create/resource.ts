import cliSpinners from 'cli-spinners';
import { colors } from 'cliffy/ansi/colors.ts';
import { EnumType } from 'cliffy/command/mod.ts';
import { Confirm } from 'cliffy/prompt/mod.ts';
import winston, { Logger } from 'winston';
import { ResourceType, ResourceTypeList } from '../../@resources/index.ts';
import { CloudGraph } from '../../cloud-graph/index.ts';
import { Pipeline } from '../../pipeline/index.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from '../base-command.ts';

const resourceType = new EnumType(ResourceTypeList);

type CreateResourceOptions = {
  account?: string;
  inputs?: string;
  verbose?: boolean;
} & GlobalOptions;

const CreateResourceCommand = BaseCommand()
  .description('Create a new cloud resource')
  .type('resourceType', resourceType)
  .option(
    '-a, --account <account:string>',
    'The cloud provider credentials to use to apply this resource',
  )
  .option(
    '-v, --verbose [verbose:boolean]',
    'Show verbose logs of the command',
    { default: false },
  )
  .arguments('[type:resourceType]')
  .action(create_resource_action);

async function create_resource_action(
  options: CreateResourceOptions,
  resource_type?: ResourceType,
) {
  const command_helper = new CommandHelper(options);

  const account = await command_helper.promptForAccount({
    account: options.account,
    type: resource_type,
    action: 'create',
  });

  const type = await command_helper.promptForResourceType(
    account,
    'create',
    resource_type,
  );

  const graph = new CloudGraph();
  const rootNode = await command_helper.promptForNewResource(
    graph,
    account,
    type,
  );

  console.log('****GRAPH') // TODO: remove
  console.log(new Pipeline())
  console.log(graph)

  const pipeline = Pipeline.plan({
    before: new Pipeline(),
    after: graph,
  });

  console.log('****PIPELINE') // TODO: remove
  console.log(pipeline)
  // throw new Error('test')

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
    })
    .toPromise()
    .then(() => {
      command_helper.renderPipeline(pipeline, { clear: !logger });
      clearInterval(interval);
      const step = pipeline.steps.find((s) => s.type === rootNode.type && s.name === rootNode.name);
      console.log('');
      console.log(colors.green(`${type} created successfully!`));
      console.log(
        'Please record the results for your records. Some fields may not be retrievable again.',
      );
      console.log(step?.outputs);
    })
    .catch((err) => {
      clearInterval(interval);
      console.error(err);
      Deno.exit(1);
    });
}

export default CreateResourceCommand;
