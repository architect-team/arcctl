import { ResourceType, ResourceTypeList } from '../../@resources/index.js';
import { BaseCommand } from '../../base-command.js';
import { createTable } from '../../utils/table.js';
import { Flags } from '@oclif/core';

export default class ListResourcesCommand extends BaseCommand {
  static description =
    'List all the cloud resources matching the specified criteria';

  static flags = {
    account: Flags.string({
      char: 'a',
      description: 'The cloud provider account to query resources from',
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
    const account = await this.promptForAccount({
      account: flags.account,
      type: args.type,
      action: 'list',
    });
    const type = (await this.promptForResourceType(
      account,
      'list',
      args.type,
    )) as ResourceType;

    const filter = {} as any;
    for (const f of flags.filter) {
      const [key, value] = f.split('=');
      filter[key] = value;
    }

    const list = account.resources[type]?.list?.bind(account.resources[type]);
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
