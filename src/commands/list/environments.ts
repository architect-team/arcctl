import { createTable } from '../../utils/table.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from '../base-command.ts';

const ListEnvironmentCommand = BaseCommand()
  .description('List registered environments')
  .action(list_environments_action);

async function list_environments_action(options: GlobalOptions) {
  const command_helper = new CommandHelper(options);

  const environments = await command_helper.environmentStore.find();
  if (environments.length <= 0) {
    console.log('No environments found');
    return;
  }

  const table = createTable({
    head: ['Name', 'Datacenter', 'Resources'],
  });

  for (const environmentRecord of environments) {
    const resourceCount = environmentRecord.priorState.nodes.filter((node) => node.action !== 'delete').length;

    table.push([environmentRecord.name, environmentRecord.datacenter, String(resourceCount)]);
  }

  console.log(table.toString());
}

export default ListEnvironmentCommand;
