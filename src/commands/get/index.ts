import { BaseCommand } from '../base-command.ts';
import GetComponentCommand from './component.ts';
import GetEnvironmentCommand from './environment.ts';

const GetCommands = BaseCommand().name('get').description('Get component or environment details');

GetCommands.command('component', GetComponentCommand.alias('components'));
GetCommands.command('environment', GetEnvironmentCommand.alias('environments'));

export default GetCommands;
