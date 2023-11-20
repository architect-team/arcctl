import { verifyDocker } from '../../docker/helper.ts';
import { exec, execVerbose } from '../../utils/command.ts';
import { BaseCommand, GlobalOptions } from '../base-command.ts';

type BuildOptions = {
  verbose: boolean;
} & GlobalOptions;

const ModulePushCommand = BaseCommand()
  .description('Push a module up to the registry')
  .arguments('<tagged_image:string>')
  .option('-v, --verbose [verbose:boolean]', 'Turn on verbose logs', { default: false })
  .action(module_push_action);

export async function module_push_action(options: BuildOptions, tagged_image: string): Promise<void> {
  verifyDocker();

  if (options.verbose) {
    const { code } = await execVerbose('docker', { args: ['push', tagged_image] });
    if (code != 0) {
      Deno.exit(code);
    }
  } else {
    const { code, stderr } = await exec('docker', { args: ['push', tagged_image] });

    if (stderr && stderr.length > 0) {
      console.error(stderr);
      Deno.exit(code);
    }
  }

  console.log(`Pushed image: ${tagged_image}`);
}

export default ModulePushCommand;
