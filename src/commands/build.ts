import { lastValueFrom } from 'rxjs';
import * as path from 'std/path/mod.ts';
import winston, { Logger } from 'winston';
import { Component, parseComponent } from '../components/index.ts';
import { verifyDocker } from '../docker/helper.ts';
import { ImageRepository } from '../oci/index.ts';
import CloudCtlConfig from '../utils/config.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from './base-command.ts';

type BuildOptions = {
  tag?: string[];
  verbose: boolean;
  containerAccount: string;
  ociAccount: string;
} & GlobalOptions;

const BuildCommand = BaseCommand()
  .description('Build a component and relevant source services')
  .arguments('<context:string>') // 'Path to the component to build'
  .option('-t, --tag <tag:string>', 'Tags to assign to the built image', { collect: true })
  .option('-c, --container-account <containerAccount:string>', 'Account used to build docker images', {
    required: true,
  })
  .option('--oci-account <ociAccount:string>', 'Account used to push docker images to OCI', { required: true })
  .option('-v, --verbose [verbose:boolean]', 'Turn on verbose logs', { default: false })
  .action(build_action);

async function build_action(options: BuildOptions, context_file: string): Promise<void> {
  verifyDocker();
  const command_helper = new CommandHelper(options);
  const context = !Deno.lstatSync(context_file).isFile ? context_file : path.dirname(context_file);

  let component: Component;
  try {
    component = await parseComponent(context);
  } catch (err: unknown) {
    if (Array.isArray(err)) {
      for (const e of err) {
        console.log(e);
      }
      return;
    } else {
      console.error(err);
      Deno.exit(1);
    }
  }

  let logger: Logger | undefined;
  if (options.verbose) {
    logger = winston.createLogger({
      level: 'info',
      format: winston.format.printf(({ message }) => message),
      transports: [new winston.transports.Console()],
    });
  }

  const containerBuildService = command_helper.providerStore.getWritableService(
    options.containerAccount,
    'containerBuild',
  );
  const ociBuildService = command_helper.providerStore.getWritableService(options.ociAccount, 'ociBuild');

  component = await component.build(async (build_options) => {
    const { outputs } = await lastValueFrom(containerBuildService.apply({
      type: 'containerBuild',
      account: options.containerAccount,
      component_source: context,
      dockerfile: build_options.dockerfile,
      context: path.isAbsolute(build_options.context)
        ? build_options.context
        : path.join(Deno.cwd(), context, build_options.context),
      args: build_options.args,
      target: build_options.target,
    }, {
      id: '',
      providerStore: command_helper.providerStore,
      logger,
    }));

    if (!outputs) {
      throw new Error(`Failed to build container for ${build_options.context}`);
    }

    return outputs.id;
  }, async (build_options) => {
    const { outputs } = await lastValueFrom(ociBuildService.apply({
      type: 'ociBuild',
      account: options.ociAccount,
      layoutDir: path.join(CloudCtlConfig.getConfigDirectory(), 'volumes'),
      files: [build_options.host_path],
    }, {
      id: '',
      providerStore: command_helper.providerStore,
      logger,
    }));

    if (!outputs) {
      throw new Error(`Failed to build volume: ${build_options.volume_name}`);
    }

    return outputs.id;
  });

  const componentTmpFile = Deno.makeTempFileSync();
  Deno.writeFileSync(componentTmpFile, new TextEncoder().encode(JSON.stringify(component)));
  const { outputs } = await lastValueFrom(ociBuildService.apply({
    type: 'ociBuild',
    account: options.ociAccount,
    layoutDir: path.join(CloudCtlConfig.getConfigDirectory(), 'components'),
    files: [],
    config: {
      file: componentTmpFile,
      mediaType: 'application/vnd.architect.component.config.v1+json',
    },
  }, {
    id: '',
    providerStore: command_helper.providerStore,
    logger,
  }));

  if (!outputs) {
    throw new Error('Something went wrong building the component');
  }

  const builtImageRef = outputs.id;
  await command_helper.componentStore.add(component);
  const containerTagService = command_helper.providerStore.getWritableService(options.containerAccount, 'containerTag');
  const ociTagService = command_helper.providerStore.getWritableService(options.ociAccount, 'ociTag');

  if (options.tag) {
    for (const tag of options.tag) {
      component = await component.tag(async (sourceRef: string, targetName: string) => {
        const imageRepository = new ImageRepository(tag);
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
          logger,
        }));
        console.log(`Image Tagged: ${targetRef}`);
        return targetRef;
      }, async (digest: string, deploymentName: string, volumeName: string) => {
        const [tagName, tagVersion] = tag.split(':');
        const target = path.join(CloudCtlConfig.getConfigDirectory(), tagName, deploymentName, 'volumes', volumeName) +
          ':' + tagVersion;
        const { outputs } = await lastValueFrom(ociTagService.apply({
          type: 'ociTag',
          account: options.ociAccount,
          source: digest,
          target,
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

      const component_digest = await command_helper.componentStore.add(component);
      command_helper.componentStore.tag(component_digest, tag);
      console.log(`Component Digest: ${outputs?.id}`);
      console.log(`Component Tagged: ${tag}`);
    }
  } else {
    console.log(`Digest: ${builtImageRef}`);
  }
}

export default BuildCommand;
