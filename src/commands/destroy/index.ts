import DestroyDatacenterCommand from './datacenter.ts';
import DestroyEnvironmentCommand from './environment.ts';
import DestroyResourceCommand from './resource.ts';

const DestroyCommands = DestroyResourceCommand;

DestroyCommands.command('datacenter', DestroyDatacenterCommand.alias('datacenters').alias('dcs').alias('dc'));
DestroyCommands.command('environment', DestroyEnvironmentCommand.alias('environments').alias('envs').alias('env'));

export default DestroyCommands;
