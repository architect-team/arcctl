import { ResourceTypeList } from '../../@resources/index.ts';
import { BaseCommand } from '../../base-command.ts';
import { Flags } from '@oclif/core';
import inquirer from 'inquirer';

export default class GetResourceCommand extends BaseCommand {
  static description = 'Get the details of a specific cloud resource';
  static displayName = 'get';

  static flags = {
    credentials: Flags.string({
      char: 'c',
      description: 'The cloud provider credentials to use to apply this resource',
    }),
  };

  static args = [
    {
      name: 'type',
      description: 'The name of the resource type to list',
      type: 'enum',
      options: ResourceTypeList,
    },
    {
      name: 'id',
      description: 'Name or ID of the resource',
      type: 'string',
    },
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(GetResourceCommand);
    const provider = await this.promptForAccount({
      account: flags.credentials,
      type: args.type,
      action: 'list',
    });
    const type = await this.promptForResourceType(provider, 'list', args.type);

    let id = args.id;
    if (!id) {
      if (!provider.resources[type]?.list) {
        throw new Error(`Unable to list the resources for ${type}`);
      }
      const results = (await provider.resources[type]?.list!()) || {
        total: 0,
        rows: [],
      };

      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'id',
          message: `Which ${type}?`,
          choices: results.rows.map((r) => r.id),
        },
      ]);
      id = answers.id;
    }

    if (!provider.resources[type]?.get) {
      throw new Error(`Unable to get the resource for ${type}`);
    }
    const results = await provider.resources[type]?.get!(id);
    this.log(JSON.stringify(results, null, 2));
  }
}
