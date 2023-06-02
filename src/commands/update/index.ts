import { BaseCommand } from '../base-command.ts';
import UpdateEnvironmentCommand from './environment.ts';
import UpdateDatacenterCommand from './datacenter.ts';

const UpdateCommands = BaseCommand();

UpdateCommands.command('datacenter', UpdateDatacenterCommand).command('environment', UpdateEnvironmentCommand);

export default UpdateCommands;
