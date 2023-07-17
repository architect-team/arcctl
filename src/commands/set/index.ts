import { BaseCommand } from '../base-command.ts';
import SetStateBackendCommand from './state-backend.ts';

const SetCommands = BaseCommand().description('Set configuration options for Arcctl');

SetCommands.command('state.backend', SetStateBackendCommand);

export default SetCommands;
