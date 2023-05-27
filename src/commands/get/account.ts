import { ResourceType } from '../../@resources/index.js';
import { BaseCommand } from '../../base-command.js';
import { createTable } from '../../utils/table.js';

export default class GetAccountCommand extends BaseCommand {
  static description = 'Get the details of an account by name';

  static aliases: string[] = ['get:accounts'];

  static args = [
    {
      name: 'name',
      description: 'The name of the account to get',
    },
  ];

  async run(): Promise<void> {
    const { args } = await this.parse(GetAccountCommand);

    const account = await this.promptForAccount({
      account: args.name,
    });

    const table1 = createTable({ head: ['Name', 'Type'] });
    table1.push([account.name, account.type]);
    this.log(`${table1.toString()}\n`);

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

    this.log(table2.toString());
  }
}
