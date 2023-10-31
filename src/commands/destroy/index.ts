import { BaseCommand } from '../base-command.ts';
import DestroyDatacenterCommand from './datacenter.ts';
import DestroyEnvironmentCommand from './environment.ts';

const DestroyCommands = BaseCommand()
  .name('destroy')
  .description('Destroy a Datacenter or Environment');

DestroyCommands.command('datacenter', DestroyDatacenterCommand.alias('datacenters').alias('dcs').alias('dc'));
DestroyCommands.command('environment', DestroyEnvironmentCommand.alias('environments').alias('envs').alias('env'));

export default DestroyCommands;
