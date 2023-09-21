import { verifyDocker } from '../docker/helper.ts';
import { exec, execVerbose } from '../utils/command.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from './base-command.ts';

type BuildOptions = {
  verbose: boolean;
} & GlobalOptions;

const PushCommand = BaseCommand()
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

    const { stdout } = await exec('docker', {
      args: ['inspect', '--format=\'{{index .RepoDigests 0}}\'', image],
    }); // Prints the repo digest wrapped in quotes, so remove those
    const image_with_sha = stdout.replace(/'/g, '').trimEnd();

    // Update the component so that it has a reference to the pushed sha
    // This ensures the component digest is different and future deployments
    // pick up changes.
    const updated_component = await component.tag(async () => {
      return image_with_sha;
    }, async () => {
      return image;
    });

    const component_digest = await command_helper.componentStore.add(updated_component);
    command_helper.componentStore.tag(component_digest, tag);

    console.log(`Pushed image: ${image_with_sha}`);
  });

  await command_helper.componentStore.push(tag);

  console.log(`Pushed Component: ${tag}`);
}

export default PushCommand;
