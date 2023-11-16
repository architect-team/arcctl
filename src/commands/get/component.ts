import yaml from 'js-yaml';
import { BaseCommand, CommandHelper, GlobalOptions } from '../base-command.ts';

export default BaseCommand()
  .description('Retrieve the component matching the specified tag')
  .arguments('<tag:string>')
  .action(async (options: GlobalOptions, tag: string) => {
    const command_helper = new CommandHelper(options);

    try {
      const component = await command_helper.componentStore.getComponentConfig(tag);
      console.log(yaml.dump(component));
    } catch (err: any) {
      console.error(err);
      Deno.exit(1);
    }
  });
