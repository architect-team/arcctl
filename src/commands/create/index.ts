import CreateDatacenterCommand from './datacenter.ts';
import CreateEnvironmentCommand from './environment.ts';
import CreateResourceCommand from './resource.ts';

const CreateCommands = CreateResourceCommand;

CreateCommands.command('datacenter', CreateDatacenterCommand).command('environment', CreateEnvironmentCommand);

export default CreateCommands;
