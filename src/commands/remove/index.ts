import { BaseCommand } from '../base-command.ts';
import RemoveAccountCommand from './account.ts';

const RemoveCommands = BaseCommand();

RemoveCommands.command('account', RemoveAccountCommand);

export default RemoveCommands;
