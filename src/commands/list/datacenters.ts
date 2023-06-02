import { BaseCommand, CommandHelper, GlobalOptions } from '../base-command.ts';
import { createTable } from '../../utils/table.ts';

const ListDatacenterCommand = BaseCommand()
  .alias('list datacenter')
  .alias('list dcs')
  .alias('list dc')
  .alias('ls datacenters')
  .alias('ls datacenter')
  .alias('ls dcs')
  .alias('ls dc')
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
    const pipeline = await command_helper.getPipelineForDatacenter(dc);
    table.push([
      dc.name,
      environmentRecords
        .filter((r) => r.datacenter === dc.name)
        .map((r) => r.name)
        .join(', '),
      String(pipeline.steps.filter((s) => s.action !== 'delete').length),
    ]);
  }

  console.log(table.toString());
}

export default ListDatacenterCommand;
