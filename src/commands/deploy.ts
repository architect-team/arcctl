import { BaseCommand, CommandHelper, GlobalOptions } from '../base-command.ts';
import { ImageRepository } from '@architect-io/arc-oci';

type DeployOptions = {
  environment: string;
} & GlobalOptions;

const DeployCommand = BaseCommand()
  .description('Deploy a component into an existing environment')
  .arguments('<tag:string>') // 'Component tag to deploy to the environment'
  .option('-e, --environment <environment:string>', 'Name of the environment to deploy to', { required: true })
  .action(deploy_action);

async function deploy_action(options: DeployOptions, tag: string): Promise<void> {
  const command_helper = new CommandHelper(options);

  try {
    const imageRepository = new ImageRepository(tag);
    const component = await command_helper.componentStore.getComponentConfig(tag);
    const environmentRecord = await command_helper.environmentStore.getEnvironment(options.environment);
  } catch (err: any) {
    console.error(err);
    Deno.exit(1);
  }
}

export default DeployCommand;
