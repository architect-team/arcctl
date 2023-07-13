import { BaseCommand } from '../base-command.ts';
import SetSecretAccountCommand from './secret-account.ts';

const SetCommands = BaseCommand().description('Set configuration options for Arcctl');

SetCommands.command('secretAccount', SetSecretAccountCommand.alias('account'));

export default SetCommands;
