import { BaseCommand } from '../base-command.ts';
import UpdateEnvironmentCommand from './environment.ts';
import UpdateDatacenterCommand from './datacenter.ts';

const UpdateCommands = BaseCommand().description('Update cloud resources');

UpdateCommands.command('datacenter', UpdateDatacenterCommand.alias('datacenters').alias('dcs').alias('dc'));
UpdateCommands.command('environment', UpdateEnvironmentCommand.alias('environments').alias('envs').alias('env'));

export default UpdateCommands;
