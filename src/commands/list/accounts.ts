import { BaseCommand, CommandHelper, GlobalOptions } from '../../base-command.ts';

import { createTable } from '../../utils/table.ts';

const ListAccountCommand = BaseCommand()
  .alias('list:accounts')
  .description('List the accounts registered with the CLI')
  .action(list_account_action);

function list_account_action(options: GlobalOptions) {
  const command_helper = new CommandHelper(options);

  const providers = command_helper.providerStore.getProviders();
  const table = createTable({
    head: ['Name', 'Type'],
  });

  for (const p of providers) {
    table.push([p.name, p.type]);
  }

  console.log(table.toString());
}

export default ListAccountCommand;
