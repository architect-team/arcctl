import { EnumType } from 'cliffy/command/mod.ts';
import { ResourceType, ResourceTypeList } from '../../@resources/index.ts';
import { createTable } from '../../utils/table.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from '../base-command.ts';

const resourceType = new EnumType(ResourceTypeList);

type ListAllResourceOptions = {
  account?: string;
} & GlobalOptions;

const ListAllResourcesCommand = BaseCommand()
  .description('List all the cloud resources for each supported type')
  .type('resourceType', resourceType)
  .option('-a, --account <account:string>', 'The cloud account to use to destroy this resource')
  .arguments('[type:resourceType]')
  .action(list_all_resources_action);

async function list_all_resources_action(options: ListAllResourceOptions, resource_type?: ResourceType) {
  const command_helper = new CommandHelper(options);

  const provider = await command_helper.promptForAccount({
    account: options.account,
    type: resource_type,
    action: 'list',
  });

  const displayableTypes: Set<ResourceType> = new Set(['kubernetesCluster', 'vpc']);

  if (!(await provider.testCredentials())) {
    throw new Error(`Unable to list resources for ${provider.name} because the credentials are invalid`);
  }

  for (const [resourceType, resourceImpl] of provider.getResourceEntries()) {
    if (!displayableTypes.has(resourceType) || !resourceImpl.list) {
      continue;
    }

    const results = await resourceImpl.list();
    if (results.rows.length === 0) {
      continue;
    }

    console.log(`Resource: ${resourceType}`);
    const table = createTable({
      head: Object.keys(results.rows[0]),
    });
    table.push(...results.rows.map((r) => Object.values(r).map(String)));
    console.log(table.toString());
    console.log();
  }
}

export default ListAllResourcesCommand;
