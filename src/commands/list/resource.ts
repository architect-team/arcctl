import { EnumType } from 'cliffy/command/mod.ts';
import { ResourceType, ResourceTypeList } from '../../@resources/index.ts';
import { createTable } from '../../utils/table.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from '../base-command.ts';

const resourceType = new EnumType(ResourceTypeList);

type ListResourceOptions = {
  account?: string;
  filter?: string[];
} & GlobalOptions;

const ListResourceCommand = BaseCommand()
  .description('List all the cloud resources matching the specified criteria')
  .type('resourceType', resourceType)
  .option('-a, --account <account:string>', 'The cloud provider account to query resources from')
  .option('-f, --filter <filter:string>', 'Values to filter results by', { collect: true })
  .arguments('[type:resourceType]')
  .action(list_resource_action);

async function list_resource_action(options: ListResourceOptions, resource_type?: ResourceType) {
  const command_helper = new CommandHelper(options);

  const account = await command_helper.promptForAccount({
    account: options.account,
    type: resource_type,
    action: 'list',
  });
  const type = (await command_helper.promptForResourceType(account, 'list', resource_type)) as ResourceType;

  const filter: Record<string, string> = {};
  for (const f of options.filter || []) {
    const [key, value] = f.split('=');
    filter[key] = value;
  }

  if (!(await account.testCredentials())) {
    throw new Error(`Unable to list resources for ${account.name} because the credentials are invalid`);
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
    console.log(table.toString());
  } else {
    console.log(`No results`);
  }
}

export default ListResourceCommand;
