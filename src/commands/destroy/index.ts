import DestroyDatacenterCommand from './datacenter.ts';
import DestroyEnvironmentCommand from './environment.ts';
import DestroyResourceCommand from './resource.ts';

const DestroyCommands = DestroyResourceCommand;

DestroyCommands.command('datacenter', DestroyDatacenterCommand).command('environment', DestroyEnvironmentCommand);

export default DestroyCommands;
