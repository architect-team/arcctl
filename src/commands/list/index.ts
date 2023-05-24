import { ResourceType, ResourceTypeList } from '../../@resources/index.ts';
import { BaseCommand } from '../../base-command.ts';
import { createTable } from '../../utils/table.ts';
import { Flags } from '@oclif/core';

export default class ListResourcesCommand extends BaseCommand {
  static description =
    'List all the cloud resources matching the specified criteria';

  static flags = {
    credentials: Flags.string({
      char: 'c',
      description:
        'The cloud provider credentials to use to apply this resource',
    }),

    filter: Flags.string({
      char: 'f',
      description: 'Values to filter results by',
      multiple: true,
      default: [],
    }),
  };

  static args = [
    {
      name: 'type',
      description: 'The name of the resource type to list',
      type: 'enum',
      options: ResourceTypeList,
    },
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(ListResourcesCommand);
    const provider = await this.promptForProvider({
      provider: flags.credentials,
      type: args.type,
      action: 'list',
    });
    const type = (await this.promptForResourceType(
      provider,
      'list',
      args.type,
    )) as ResourceType;

    const filter = {} as any;
    for (const f of flags.filter) {
      const [key, value] = f.split('=');
      filter[key] = value;
    }

    const list = provider.resources[type]?.list?.bind(provider.resources[type]);
    if (!list) {
      throw new Error(`Unable to list the resources for ${type}`);
    }
    const results = await list(filter);

    if (results.rows.length > 0) {
      const table = createTable({
        head: Object.keys(results.rows[0]),
      });
      table.push(...results.rows.map((r) => Object.values(r).map(String)));
      this.log(table.toString());
    } else {
      this.log(`No results`);
    }
  }
}
