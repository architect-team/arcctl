import { ResourceType, ResourceTypeList } from '../../@resources/types.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from '../base-command.ts';
import { Pipeline, PipelineStep } from '../../pipeline/index.ts';
import { colors } from 'cliffy/ansi/colors.ts';
import { EnumType } from 'cliffy/command/mod.ts';
import cliSpinners from 'cli-spinners';
import winston, { Logger } from 'winston';
import { Confirm, Select } from 'cliffy/prompt/mod.ts';

const resourceType = new EnumType(ResourceTypeList);

type DestroyResourceOptions = {
  account?: string;
  verbose: boolean;
} & GlobalOptions;

const DestroyResourceCommand = BaseCommand()
  .description('Destroy a cloud resource')
  .type('resourceType', resourceType)
  .option('-a, --account <account:string>', 'The cloud account to use to destroy this resource')
  .option('-v, --verbose', 'Turn on verbose logs', { default: false })
  .arguments('[type:resourceType] [id:string]')
  .action(destroy_resource_action);

async function destroy_resource_action(
  options: DestroyResourceOptions,
  resource_type?: ResourceType,
  resource_id?: string,
) {
  const command_helper = new CommandHelper(options);

  if (resource_type) {
    const is_creatable_type = await command_helper.isCreatableResourceType(resource_type);
    if (!is_creatable_type) {
      console.error(`Deletion of ${resource_type} resources is not supported`);
      Deno.exit(1);
    }
  }

  const account = await command_helper.promptForAccount({
    account: options.account,
    type: resource_type,
    action: 'delete',
  });

  const type = await command_helper.promptForResourceType(account, 'delete', resource_type);

  const service = account.resources[type];
  if (!service) {
    console.error(`The ${account.type} provider doesn't support ${type} resources`);
    Deno.exit(1);
  }

  let choices: { name: string; value: string }[] = [];
  if (service.list) {
    const res = await service.list();
    choices = res.rows.map((row) => ({
      // deno-lint-ignore no-explicit-any
      name: (row as any).name ? `${(row as any).name} (${row.id})` : row.id,
      value: row.id,
    }));
  }

  if (choices.length === 0) {
    console.log(colors.yellow('No resources were found'));
    Deno.exit(0);
  }

  resource_id =
    resource_id ||
    (await Select.prompt({
      message: `Which ${type} resource should be deleted?`,
      options: choices,
    }));

  if (!choices.find((r) => r.name === resource_id)) {
    console.log(`Invalid resource ID: ${resource_id}`);
    Deno.exit(1);
  }

  const proceed = await Confirm.prompt(
    `Are you sure you would like to delete this resource? Don't interrupt the process once it starts!`,
  );

  if (!proceed) {
    Deno.exit(0);
  }

  const step = new PipelineStep({
    action: 'delete',
    name: type,
    type: type,
    resource: {
      account: account.name,
      id: resource_id,
    },
  });

  const pipeline = new Pipeline({ steps: [step] });

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
    .then(() => {
      command_helper.renderPipeline(pipeline, { clear: true });
      clearInterval(interval);
      console.log('');
      console.log(colors.green(`${type} destroyed successfully!`));
    })
    .catch((err) => {
      clearInterval(interval);
      console.error(err);
      Deno.exit(1);
    });
}

export default DestroyResourceCommand;
