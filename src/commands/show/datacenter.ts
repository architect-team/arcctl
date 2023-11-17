import yaml from 'js-yaml';
import { BaseCommand, CommandHelper, GlobalOptions } from '../base-command.ts';

export const ShowDatacenterCommand = BaseCommand()
  .description('Show the contents of the datacenter state')
  .arguments('<datacenter_name:string>')
  .action(async (options: GlobalOptions, datacenter_name: string) => {
    const command_helper = new CommandHelper(options);

    try {
      const record = await command_helper.datacenterStore.get(datacenter_name);
      if (!record) {
        console.error(`%cDatacenter "${datacenter_name}" not found`, 'color: red');
        Deno.exit(1);
      }

      console.log(yaml.dump(record));
    } catch (err: any) {
      console.error(err);
      Deno.exit(1);
    }
  });
