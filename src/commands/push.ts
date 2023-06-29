import { verifyDocker } from '../docker/helper.ts';
import { exec } from '../utils/command.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from './base-command.ts';

type BuildOptions = GlobalOptions;

const PushCommand = BaseCommand()
  .description('Push a component up to the registry')
  .arguments('<tag:string>')
  .action(push_action);

async function push_action(options: BuildOptions, tag: string): Promise<void> {
  verifyDocker();
  const command_helper = new CommandHelper(options);

  const component = await command_helper.componentStore.getComponentConfig(tag);
  await component.push(async (image: string) => {
    await exec('docker', { args: ['push', image] });
  }, async (deploymentName: string, volumeName: string, image: string, host_path: string, mount_path: string) => {
    const [name, version] = tag.split(':');
    const ref = `${name}/${deploymentName}/volume/${volumeName}:${version}`;
    await command_helper.componentStore.pushVolume(
      {
        component: deploymentName,
        mount_path,
        host_path,
      },
      image,
      ref,
    );
    console.log(`Pushed Volume ${ref}`);
  });
  console.log(`Pushed ${tag}`);
}

export default PushCommand;
