import { BaseCommand } from '../../base-command.ts';
import { getProviders } from '../../utils/providers.ts';
import { createTable } from '../../utils/table.ts';

export default class ListAccountsCommand extends BaseCommand {
  static description = 'List the accounts registered with the CLI';

  static aliases: string[] = ['list:account'];

  async run(): Promise<void> {
    const providers = await getProviders(this.config.configDir);
    const table = createTable({
      head: ['Name', 'Type'],
    });

    for (const p of providers) {
      table.push([p.name, p.type]);
    }

    this.log(table.toString());
  }
}
