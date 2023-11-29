import ArcctlConfig from '../../utils/config.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from '../base-command.ts';
import { Inputs } from '../common/inputs.ts';

type DefaultDatacenterOptions = GlobalOptions;

const SetDefaultDatacenterCommand = BaseCommand()
  .description('Configure which datacenter should be used by default for the "up" command')
  .arguments('[datacenter:string]')
  .action(set_default_datacenter);

async function set_default_datacenter(options: DefaultDatacenterOptions, datacenter?: string) {
  const command_helper = new CommandHelper(options);
  const default_datacenter = await promptForDatacenter(command_helper, datacenter);
  ArcctlConfig.setDefaultDatacenter(default_datacenter);
  ArcctlConfig.save();
  console.log(`Successfully set the default datacenter to: ${default_datacenter}`);
}

async function promptForDatacenter(command_helper: CommandHelper, datacenter?: string): Promise<string> {
  const datacenterRecords = await command_helper.datacenterStore.find();
  if (datacenterRecords.length <= 0) {
    console.error('No datacenters available to set as default.');
    Deno.exit(1);
  }

  if (!datacenter) {
    datacenter = await Inputs.promptSelection({
      message: 'Select a datacenter to set as default',
      options: datacenterRecords.map((r) => ({
        name: r.name,
        value: r.name,
      })),
    });
  }

  const selected = datacenterRecords.find((d) => d.name === datacenter);
  if (!selected) {
    console.log(`Unable to find datacenter: ${datacenter}`);
    Deno.exit(1);
  }

  return selected.name;
}

export default SetDefaultDatacenterCommand;
