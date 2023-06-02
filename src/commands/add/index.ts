import { BaseCommand } from '../base-command.ts';
import AddAccountCommand from './account.ts';

const AddCommands = BaseCommand();

AddCommands.command('account', AddAccountCommand);

export default AddCommands;
