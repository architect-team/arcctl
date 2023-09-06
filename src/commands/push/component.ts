import { verifyDocker } from '../../docker/helper.ts';
import { exec, execVerbose } from '../../utils/command.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from '../base-command.ts';

type BuildOptions = {
  verbose: boolean;
} & GlobalOptions;

const ComponentPushCommand = BaseCommand()
  .description('Push a component up to the registry')
  .arguments('<tag:string>')
  .option('-v, --verbose [verbose:boolean]', 'Turn on verbose logs', { default: false })
  .action(push_action);

async function push_action(options: BuildOptions, tag: string): Promise<void> {
  verifyDocker();
  const command_helper = new CommandHelper(options);

  const component = await command_helper.componentStore.getComponentConfig(tag);
  await component.push(async (image: string) => {
    if (options.verbose) {
      const { code } = await execVerbose('docker', { args: ['push', image] });
      if (code != 0) {
        Deno.exit(code);
      }
    } else {
      const { code, stderr } = await exec('docker', { args: ['push', image] });

      if (stderr && stderr.length > 0) {
        console.error(stderr);
        Deno.exit(code);
      }
    }

    console.log(`Pushed image: ${image}`);
  });

  await command_helper.componentStore.push(tag);

  console.log(`Pushed Component: ${tag}`);
}

export default ComponentPushCommand;
