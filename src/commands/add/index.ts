import { BaseCommand } from '../base-command.ts';
import AddAccountCommand from './account.ts';

const AddCommands = BaseCommand().description('Register existing things with arcctl');

AddCommands.command('account', AddAccountCommand.alias('accounts'));

export default AddCommands;
