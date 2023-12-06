import { verifyDocker } from '../docker/helper.ts';
import { ImageRepository } from '../oci/index.ts';
import { exec } from '../utils/command.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from './base-command.ts';

const TagCommand = BaseCommand()
  .name('tag')
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
      const targetRef = imageRepository.toString() + '-' + targetName;
      await exec('docker', { args: ['tag', sourceRef, targetRef] });
      console.log(`Deployment Tagged: ${targetRef}`);
      return targetRef;
    });

    command_helper.componentStore.tag(source, target);
    console.log(`Tagged: ${target}`);
  } catch (err) {
    console.error(err);
    Deno.exit(1);
  }
}

export default TagCommand;
