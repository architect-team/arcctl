import yaml from 'js-yaml';
import { BaseCommand, CommandHelper, GlobalOptions } from '../base-command.ts';

export const ShowEnvironmentCommand = BaseCommand()
  .description('Show the contents of the environment state')
  .arguments('<environment_name:string>')
  .action(async (options: GlobalOptions, environment_name: string) => {
    const command_helper = new CommandHelper(options);

    try {
      const record = await command_helper.environmentStore.get(environment_name);
      if (!record) {
        console.error(`%cEnvironment "${environment_name}" not found`, 'color: red');
        Deno.exit(1);
      }

      console.log(yaml.dump(record));
    } catch (err: any) {
      console.error(err);
      Deno.exit(1);
    }
  });
