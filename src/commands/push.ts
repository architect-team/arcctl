import { lastValueFrom } from 'rxjs';
import winston, { Logger } from 'winston';
import { verifyDocker } from '../docker/helper.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from './base-command.ts';

type BuildOptions = {
  account: string;
} & GlobalOptions;

const PushCommand = BaseCommand()
  .description('Push a component up to the registry')
  .arguments('<tag:string>')
  .option('-a, --account <account:string>', 'Account used to push docker images', { required: true })
  .option('-v, --verbose [verbose:boolean]', 'Turn on verbose logs', { default: false })
  .action(push_action);

async function push_action(options: BuildOptions, tag: string): Promise<void> {
  verifyDocker();
  const command_helper = new CommandHelper(options);

  const containerPushService = command_helper.providerStore.getWritableService(options.account, 'containerPush');
  const ociPushService = command_helper.providerStore.getWritableService(options.account, 'ociPush');
  const component = await command_helper.componentStore.getComponentConfig(tag);

  let logger: Logger | undefined;
  if (options.verbose) {
    logger = winston.createLogger({
      level: 'info',
      format: winston.format.printf(({ message }) => message),
    });
  }

  await component.push(async (image: string) => {
    const { outputs } = await lastValueFrom(containerPushService.apply({
      type: 'containerPush',
      account: options.account,
      image,
    }, {
      id: '',
      providerStore: command_helper.providerStore,
      logger,
    }));

    console.log(`Pushed image: ${outputs?.id}`);
  }, async (deploymentName: string, volumeName: string, image: string, host_path: string, mount_path: string) => {
    const [name, version] = tag.split(':');
    const ref = `${name}/${deploymentName}/volumes/${volumeName}:${version}`;
    await lastValueFrom(ociPushService.apply({
      type: 'ociPush',
      account: options.account,
      source: image,
      target: ref,
    }, {
      id: '',
      providerStore: command_helper.providerStore,
      logger,
    }));

    console.log(`Pushed Volume ${ref}`);
  });

  await lastValueFrom(ociPushService.apply({
    type: 'ociPush',
    account: options.account,
    source: component.image,
    target: tag,
  }, {
    id: '',
    providerStore: command_helper.providerStore,
    logger,
  }));

  console.log(`Pushed Component: ${tag}`);
}

export default PushCommand;
