import { ResourceType } from '../../@resources/index.js';
import { BaseCommand } from '../../base-command.js';
import { getProviders } from '../../utils/providers.js';
import { createTable } from '../../utils/table.js';

export default class GetProviderCommand extends BaseCommand {
  static description = 'Get the details of a provider by name';
  static displayName = 'get provider';

  static aliases: string[] = ['get providers'];

  static args = [
    {
      name: 'name',
      description: 'The name of the provider to get',
    },
  ];

  async run(): Promise<void> {
    const { args } = await this.parse(GetProviderCommand);
    const providers = await getProviders(this.config.configDir);
    const provider = providers.find((p) => p.name === args.name);
    if (!provider) {
      this.error(`Provider ${args.name} not found`);
    }

    const table1 = createTable({ head: ['Name', 'Type'] });
    table1.push([provider.name, provider.type]);
    this.log(`${table1.toString()}\n`);

    const table2 = createTable({
      head: ['Capabilities', ''],
    });

    const capabilities: { [key in ResourceType]?: string[] } = {};
    for (const [type, impl] of provider.getResourceEntries()) {
      capabilities[type] = capabilities[type] || [];

      if (impl.list) {
        capabilities[type]?.push('list');
      }

      if (impl.get) {
        capabilities[type]?.push('get');
      }

      if (impl.manage) {
        capabilities[type]?.push('create', 'delete');
      }
    }

    for (const [key, actions] of Object.entries(capabilities)) {
      table2.push([key, actions?.join(', ') || '']);
    }

    this.log(table2.toString());
  }
}
