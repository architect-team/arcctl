import { lastValueFrom } from 'rxjs';
import * as path from 'std/path/mod.ts';
import winston, { Logger } from 'winston';
import { verifyDocker } from '../docker/helper.ts';
import { ImageRepository } from '../oci/index.ts';
import CloudCtlConfig from '../utils/config.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from './base-command.ts';

type TagOptions = GlobalOptions & {
  containerAccount: string;
  ociAccount: string;
};

const TagCommand = BaseCommand()
  .description('Tag a component and its associated build artifacts')
  .arguments('<source:string> <target:string>')
  .option('--container-account <containerAccount:string>', 'Account used to build docker images', {
    required: true,
  })
  .option('--oci-account <ociAccount:string>', 'Account used to push OCI images', { required: true })
  .option('-v, --verbose [verbose:boolean]', 'Turn on verbose logs', { default: false })
  .action(tag_action);

async function tag_action(options: TagOptions, source: string, target: string) {
  verifyDocker();
  const command_helper = new CommandHelper(options);

  let logger: Logger | undefined;
  if (options.verbose) {
    logger = winston.createLogger({
      level: 'info',
      format: winston.format.printf(({ message }) => message),
      transports: [new winston.transports.Console()],
    });
  }

  try {
    const component = await command_helper.componentStore.getComponentConfig(source);
    const containerTagService = command_helper.providerStore.getWritableService(
      options.containerAccount,
      'containerTag',
    );
    const ociTagService = command_helper.providerStore.getWritableService(options.ociAccount, 'ociTag');

    component.tag(async (sourceRef: string, targetName: string) => {
      const imageRepository = new ImageRepository(target);
      imageRepository.repository = `${imageRepository.repository}-${targetName}`;
      const targetRef = imageRepository.toString();

      await lastValueFrom(containerTagService.apply({
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
      const [tagName, tagVersion] = target.split(':');
      const targetRef = path.join(CloudCtlConfig.getConfigDirectory(), tagName, deploymentName, 'volumes', volumeName) +
        ':' + tagVersion;
      const { outputs } = await lastValueFrom(ociTagService.apply({
        type: 'ociTag',
        account: options.ociAccount,
        source: digest,
        target: targetRef,
      }, {
        id: '',
        providerStore: command_helper.providerStore,
        logger,
      }));

      if (!outputs) {
        throw new Error(`Failed to move ${digest} to ${target}`);
      }

      return outputs.id;
    });

    await lastValueFrom(ociTagService.apply({
      type: 'ociTag',
      account: options.ociAccount,
      source: builtImageRef,
      target: tag,
    }, {
      id: '',
      providerStore: command_helper.providerStore,
      logger,
    }));

    command_helper.componentStore.tag(source, target);
    console.log(`Tagged: ${target}`);
  } catch (err) {
    console.error(err);
    Deno.exit(1);
  }
}

export default TagCommand;
