import { BaseCommand, CommandHelper, GlobalOptions } from '../base-command.ts';
import { createTable } from '../../utils/table.ts';

const ListEnvironmentCommand = BaseCommand()
  .alias('list environment')
  .alias('list envs')
  .alias('list env')
  .alias('ls environments')
  .alias('ls environment')
  .alias('ls envs')
  .alias('ls env')
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

  for (const { name, datacenter } of environments) {
    const datacenterRecord = await command_helper.datacenterStore.get(datacenter);

    let resourceCount = 0;
    if (datacenterRecord) {
      const pipeline = await command_helper.getPipelineForDatacenter(datacenterRecord);
      resourceCount = pipeline.steps.filter((step) => step.action !== 'delete' && step.environment === name).length;
    }

    table.push([name, datacenter, String(resourceCount)]);
  }

  console.log(table.toString());
}

export default ListEnvironmentCommand;
