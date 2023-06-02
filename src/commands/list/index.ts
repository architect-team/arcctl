import ListAccountsCommand from './accounts.ts';
import ListDatacentersCommand from './datacenters.ts';
import ListEnvironmentsCommand from './environments.ts';
import ListResourcesCommand from './resource.ts';
import ListAllResourcesCommand from './all.ts';

const ListCommands = ListResourcesCommand;

ListCommands.command('accounts', ListAccountsCommand)
  .command('datacenters', ListDatacentersCommand)
  .command('environments', ListEnvironmentsCommand)
  .command('all', ListAllResourcesCommand);

export default ListCommands;
