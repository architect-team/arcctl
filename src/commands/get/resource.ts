import { ResourceType, ResourceTypeList } from '../../@resources/index.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from '../base-command.ts';
import { EnumType } from 'cliffy/command/mod.ts';
import { Select } from 'cliffy/prompt/mod.ts';

const resourceType = new EnumType(ResourceTypeList);

type GetResourceOption = {
  account?: string;
} & GlobalOptions;

const GetResourceCommand = BaseCommand()
  .description('Get the details of a specific cloud resource')
  .type('resourceType', resourceType)
  .option('-a, --account <account:string>', 'The cloud account to use to destroy this resource')
  .arguments('[type:resourceType] [id:string]')
  .action(get_resource_action);

async function get_resource_action(options: GetResourceOption, resource_type?: ResourceType, resource_id?: string) {
  const command_helper = new CommandHelper(options);

  const provider = await command_helper.promptForAccount({
    account: options.account,
    type: resource_type,
    action: 'list',
  });
  const type = await command_helper.promptForResourceType(provider, 'list', resource_type);

  if (!resource_id) {
    if (!provider.resources[type]?.list) {
      throw new Error(`Unable to list the resources for ${type}`);
    }
    const results = (await provider.resources[type]?.list!()) || {
      total: 0,
      rows: [],
    };

    resource_id = await Select.prompt({
      message: `Which ${type}?`,
      options: results.rows.map((r) => r.id),
    });
  }

  if (!provider.resources[type]?.get) {
    throw new Error(`Unable to get the resource for ${type}`);
  }
  const results = await provider.resources[type]?.get!(resource_id!);
  console.log(JSON.stringify(results, null, 2));
}

export default GetResourceCommand;
