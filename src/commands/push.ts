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

  const pushService = command_helper.providerStore.getWritableService(options.account, 'containerPush');
  const component = await command_helper.componentStore.getComponentConfig(tag);

  let logger: Logger | undefined;
  if (options.verbose) {
    logger = winston.createLogger({
      level: 'info',
      format: winston.format.printf(({ message }) => message),
    });
  }

  await component.push(async (image: string) => {
    const { outputs } = await lastValueFrom(pushService.apply({
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

  console.log(`Pushed Component: ${tag}`);
}

export default PushCommand;
