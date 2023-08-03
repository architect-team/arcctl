import GetAccountCommand from './account.ts';
import GetComponentCommand from './component.ts';
import GetEnvironmentCommand from './environment.ts';
import GetResourceCommand from './resource.ts';

const GetCommands = GetResourceCommand;

GetCommands.command('account', GetAccountCommand.alias('accounts'));
GetCommands.command('component', GetComponentCommand.alias('components'));
GetCommands.command('environment', GetEnvironmentCommand.alias('environments'));

export default GetCommands;
