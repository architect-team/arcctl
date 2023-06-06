import CreateDatacenterCommand from './datacenter.ts';
import CreateEnvironmentCommand from './environment.ts';
import CreateResourceCommand from './resource.ts';

const CreateCommands = CreateResourceCommand;

CreateCommands.command('datacenter', CreateDatacenterCommand.alias('datacenters').alias('dcs').alias('dc'));
CreateCommands.command('environment', CreateEnvironmentCommand.alias('environments').alias('envs').alias('env'));

export default CreateCommands;
