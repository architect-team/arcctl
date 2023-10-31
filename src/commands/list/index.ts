import { BaseCommand } from '../base-command.ts';
import ListDatacentersCommand from './datacenters.ts';
import ListEnvironmentsCommand from './environments.ts';

const ListCommands = BaseCommand()
  .name('list')
  .alias('ls')
  .description('List environments or datacenters');

ListCommands.command('environments', ListEnvironmentsCommand.alias('environment').alias('envs').alias('env'));
ListCommands.command('datacenters', ListDatacentersCommand.alias('datacenter').alias('dcs').alias('dc'));

export default ListCommands;
