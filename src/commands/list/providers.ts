import { BaseCommand } from '../../base-command.js';
import { getProviders } from '../../utils/providers.js';
import { createTable } from '../../utils/table.js';

export default class ListProvidersCommand extends BaseCommand {
  static description = 'List the providers registered with the CLI';
  static displayName = 'list providers';

  static aliases: string[] = [
    'provider:list',
    'providers:list',
  ];

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
