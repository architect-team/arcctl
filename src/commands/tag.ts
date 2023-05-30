import { BaseCommand, CommandHelper, GlobalOptions } from '../base-command.ts';
import { ImageRepository } from '@architect-io/arc-oci';
import { execa } from 'execa';
import * as path from 'std/path/mod.ts';

const TagCommand = BaseCommand()
  .description('Tag a component and its associated build artifacts')
  .arguments('<source:string> <target:string>')
  .action(tag_action);

async function tag_action(options: GlobalOptions, source: string, target: string) {
  const command_helper = new CommandHelper(options);

  try {
    const component = await command_helper.componentStore.getComponentConfig(source);
    console.log(component);

    component.tag(async (sourceRef: string, targetName: string) => {
      const imageRepository = new ImageRepository(target);
      const suffix = imageRepository.tag ? ':' + imageRepository.tag : '';
      const targetRef = path.join(imageRepository.registry, `${targetName}${suffix}`);

      await execa('docker', ['tag', sourceRef, targetRef]);
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
