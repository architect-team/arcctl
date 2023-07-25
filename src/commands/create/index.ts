import CreateDatacenterCommand from './datacenter.ts';
import CreateEnvironmentCommand from './environment.ts';
import CreateResourceCommand from './resource.ts';

const CreateCommands = CreateResourceCommand;

// Aliases are handled by the apply command setup. All aliases are applied to the create command.
CreateCommands.command('datacenter', CreateDatacenterCommand);
CreateCommands.command('environment', CreateEnvironmentCommand);

export default CreateCommands;
