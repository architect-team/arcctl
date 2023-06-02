import GetAccountCommand from './account.ts';
import GetComponentCommand from './component.ts';
import GetResourceCommand from './resource.ts';

const GetCommands = GetResourceCommand;

GetCommands.command('account', GetAccountCommand).command('component', GetComponentCommand);

export default GetCommands;
