import { BaseCommand } from '../base-command.ts';
import ApplyDatacenterCommand from './datacenter.ts';
import ApplyEnvironmentCommand from './environment.ts';

const ApplyCommands = BaseCommand()
  .name('apply')
  .alias('create')
  .description('Apply changes to an environment or datacenter');

ApplyCommands.command('datacenter', ApplyDatacenterCommand.alias('datacenters').alias('dcs').alias('dc'));
ApplyCommands.command('environment', ApplyEnvironmentCommand.alias('environments').alias('envs').alias('env'));

export default ApplyCommands;
