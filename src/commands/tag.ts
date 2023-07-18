import { lastValueFrom } from 'rxjs';
import { verifyDocker } from '../docker/helper.ts';
import { ImageRepository } from '../oci/index.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from './base-command.ts';

type TagOptions = GlobalOptions & {
  containerAccount: string;
};

const TagCommand = BaseCommand()
  .description('Tag a component and its associated build artifacts')
  .arguments('<source:string> <target:string>')
  .option('-c, --container-account <containerAccount:string>', 'Account used to build docker images', {
    required: true,
  })
  .action(tag_action);

async function tag_action(options: TagOptions, source: string, target: string) {
  verifyDocker();
  const command_helper = new CommandHelper(options);

  try {
    const component = await command_helper.componentStore.getComponentConfig(source);
    const tagService = command_helper.providerStore.getWritableService(options.containerAccount, 'containerTag');

    component.tag(async (sourceRef: string, targetName: string) => {
      const imageRepository = new ImageRepository(target);
      imageRepository.repository = `${imageRepository.repository}-${targetName}`;
      const targetRef = imageRepository.toString();

      await lastValueFrom(tagService.apply({
        type: 'containerTag',
        account: options.containerAccount,
        source: sourceRef,
        target: targetRef,
      }, {
        id: '',
        providerStore: command_helper.providerStore,
      }));
      console.log(`Image Tagged: ${targetRef}`);
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
