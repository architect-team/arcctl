import * as path from 'std/path/mod.ts';
import { verifyDocker } from '../docker/helper.ts';
import { ImageRepository } from '../oci/index.ts';
import { exec } from '../utils/command.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from './base-command.ts';

const TagCommand = BaseCommand()
  .description('Tag a component and its associated build artifacts')
  .arguments('<source:string> <target:string>')
  .action(tag_action);

async function tag_action(options: GlobalOptions, source: string, target: string) {
  verifyDocker();
  const command_helper = new CommandHelper(options);

  try {
    const component = await command_helper.componentStore.getComponentConfig(source);

    component.tag(async (sourceRef: string, targetName: string) => {
      const imageRepository = new ImageRepository(target);
      const suffix = imageRepository.tag ? ':' + imageRepository.tag : '';
      const targetRef = path.join(imageRepository.registry, `${targetName}${suffix}`);

      await exec('docker', { args: ['tag', sourceRef, targetRef] });
      return targetRef;
    }, async (digest: string, deploymentName: string, volumeName: string) => {
      console.log(`Tagging volume ${volumeName} for deployment ${deploymentName} with digest ${digest}`);
      const [tagName, tagVersion] = target.split(':');
      const volumeTag = `${tagName}/${deploymentName}/volume/${volumeName}:${tagVersion}`;
      return volumeTag;
    });

    command_helper.componentStore.tag(source, target);
    console.log(`Tagged: ${target}`);
  } catch (err) {
    console.error(err);
    Deno.exit(1);
  }
}

export default TagCommand;
