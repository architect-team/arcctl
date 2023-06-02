import { ResourceType } from '../../@resources/index.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from '../base-command.ts';
import { createTable } from '../../utils/table.ts';

const GetAccountCommand = BaseCommand()
  .alias('get accounts')
  .description('Get the details of an account by name')
  .arguments('[name:string]')
  .action(get_account_action);

async function get_account_action(options: GlobalOptions, name?: string) {
  const command_helper = new CommandHelper(options);

  const account = await command_helper.promptForAccount({
    account: name,
  });

  const table1 = createTable({ head: ['Name', 'Type'] });
  table1.push([account.name, account.type]);
  console.log(`${table1.toString()}\n`);

  const table2 = createTable({
    head: ['Capabilities', ''],
  });

  const capabilities: { [key in ResourceType]?: string[] } = {};
  for (const [type, impl] of account.getResourceEntries()) {
    capabilities[type] = capabilities[type] || ['list', 'get'];

    if ('construct' in impl || 'create' in impl) {
      capabilities[type]?.push('create', 'update', 'delete');
    }
  }

  for (const [key, actions] of Object.entries(capabilities)) {
    table2.push([key, actions?.join(', ') || '']);
  }

  console.log(table2.toString());
}

export default GetAccountCommand;
