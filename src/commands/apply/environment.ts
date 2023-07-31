import winston, { Logger } from 'winston';
import { parseEnvironment } from '../../environments/parser.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from '../base-command.ts';
import { applyEnvironment } from './utils.ts';

type ApplyEnvironmentOptions = {
  datacenter?: string;
  verbose?: boolean;
  autoApprove: boolean;
} & GlobalOptions;

const ApplyEnvironmentCommand = BaseCommand()
  .description('create or update an environment')
  .option('-d, --datacenter <datacenter:string>', 'Datacenter for the environment')
  .option('-v, --verbose [verbose:boolean]', 'Verbose output', { default: false })
  .option('--auto-approve [autoApprove:boolean]', 'Skip all prompts and start the requested action', { default: false })
  .arguments(
    '<name:string> [config_path:string]',
  )
  .action(applyEnvironmentAction);

export async function applyEnvironmentAction(options: ApplyEnvironmentOptions, name: string, config_path?: string) {
  const command_helper = new CommandHelper(options);

  let logger: Logger | undefined;
  if (options.verbose) {
    logger = winston.createLogger({
      level: 'info',
      format: winston.format.printf(({ message }) => message),
      transports: [new winston.transports.Console()],
    });
  }

  return applyEnvironment({
    command_helper,
    logger,
    name,
    autoApprove: options.autoApprove,
    datacenter: options.datacenter,
    targetEnvironment: await parseEnvironment(config_path || {}),
  });
}

export default ApplyEnvironmentCommand;
