import yaml from 'js-yaml';
import { BaseCommand, CommandHelper, GlobalOptions } from '../base-command.ts';

const GetEnvironmentConfigCommand = BaseCommand()
  .description('Retrieve the environment matching the specified name')
  .arguments('<name:string>')
  .action(getEnvironmentConfigAction);

async function getEnvironmentConfigAction(options: GlobalOptions, name: string) {
  const command_helper = new CommandHelper(options);

  try {
    const environmentRecord = await command_helper.environmentStore.get(name);
    if (!environmentRecord) {
      console.error(`%cEnvironment "${name}" not found`, 'color: red');
      Deno.exit(1);
    }

    console.log(yaml.dump(environmentRecord.config));
  } catch (err: any) {
    console.error(err);
    Deno.exit(1);
  }
}

export default GetEnvironmentConfigCommand;
