import { createTable } from '../../utils/table.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from '../base-command.ts';

const ListDatacenterCommand = BaseCommand()
  .description('List datacenters registered with the CLI')
  .action(list_datacenter_action);

async function list_datacenter_action(options: GlobalOptions) {
  const command_helper = new CommandHelper(options);

  const datacenters = await command_helper.datacenterStore.find();

  if (datacenters.length <= 0) {
    console.log('No registered datacenters');
    return;
  }

  const environmentRecords = await command_helper.environmentStore.find();

  const table = createTable({
    head: ['Name', 'Environments', 'Resources'],
  });

  for (const dc of datacenters) {
    table.push([
      dc.name,
      environmentRecords
        .filter((r) => r.datacenter === dc.name)
        .map((r) => r.name)
        .join(', '),
      String(dc.priorState.nodes.filter((n) => n.action !== 'delete').length),
    ]);
  }

  console.log(table.toString());
}

export default ListDatacenterCommand;
