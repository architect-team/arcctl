import { BaseCommand } from '../base-command.ts';
import RemoveAccountCommand from './account.ts';

const RemoveCommands = BaseCommand().alias('rm').description('De-register things from arcctl');

RemoveCommands.command('account', RemoveAccountCommand.alias('accounts'));

export default RemoveCommands;
