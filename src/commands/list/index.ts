import ListAccountsCommand from './accounts.ts';
import ListDatacentersCommand from './datacenters.ts';
import ListEnvironmentsCommand from './environments.ts';
import ListResourcesCommand from './resource.ts';
import ListAllResourcesCommand from './all.ts';

const ListCommands = ListResourcesCommand.alias('ls');

ListCommands.command('accounts', ListAccountsCommand.alias('account'));
ListCommands.command('datacenters', ListDatacentersCommand.alias('datacenter').alias('dcs').alias('dc'));
ListCommands.command('environments', ListEnvironmentsCommand.alias('environment').alias('envs').alias('env'));
ListCommands.command('all', ListAllResourcesCommand);

export default ListCommands;
