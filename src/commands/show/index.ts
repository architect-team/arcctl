import { BaseCommand } from '../base-command.ts';
import { ShowDatacenterCommand } from './datacenter.ts';
import { ShowEnvironmentCommand } from './environment.ts';

const ShowCommands = BaseCommand()
  .name('show')
  .description('Show stored state and configuration for datacenters or environments');

ShowCommands.command('datacenter', ShowDatacenterCommand).alias('dc').alias('dcs').alias('datacenters');
ShowCommands.command('environment', ShowEnvironmentCommand).alias('env').alias('envs').alias('environments');

export default ShowCommands;
