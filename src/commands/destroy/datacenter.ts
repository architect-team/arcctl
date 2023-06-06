import { BaseCommand, CommandHelper, GlobalOptions } from '../base-command.ts';
import { CloudGraph } from '../../cloud-graph/index.ts';
import { DatacenterRecord } from '../../datacenters/index.ts';
import { Pipeline } from '../../pipeline/index.ts';
import cliSpinners from 'cli-spinners';
import * as path from 'std/path/mod.ts';
import winston, { Logger } from 'winston';
import { Confirm, Select } from 'cliffy/prompt/mod.ts';

type DestroyDatacenterOptions = {
  verbose: boolean;
  autoApprove: boolean;
} & GlobalOptions;

const DestroyDatacenterCommand = BaseCommand()
  .description('Destroy a datacenter and all the environments managed by it')
  .option('-v, --verbose [verbose:boolean]', 'Turn on verbose logs', { default: false })
  .option('--auto-approve', 'Skip all prompts and start the requested action', { default: false })
  .arguments('[name:string]')
  .action(destroy_datacenter_action);

async function destroy_datacenter_action(options: DestroyDatacenterOptions, name?: string) {
  const command_helper = new CommandHelper(options);

  const datacenterRecord = await promptForDatacenter(command_helper, name);
  const lastPipeline = await command_helper.getPipelineForDatacenter(datacenterRecord);
  const pipeline = Pipeline.plan({
    before: lastPipeline,
    after: new CloudGraph(),
  });

  const allEnvs = await command_helper.environmentStore.find();
  const datacenterEnvs = allEnvs.filter((env) => env.datacenter === datacenterRecord.name);

  if (datacenterEnvs.length > 0) {
    console.log('This will also destroy all the following environments:');
    for (const env of datacenterEnvs) {
      console.log(`- ${env.name}`);
    }

    const confirm = options.autoApprove === true || (await Confirm.prompt('Are you sure you want to proceed?'));

    if (!confirm) {
      console.error('Datacenter destruction cancelled');
      Deno.exit(1);
    }
  }

  let interval: number;
  if (!options.verbose) {
    interval = setInterval(() => {
      command_helper.renderPipeline(pipeline, { clear: true });
    }, 1000 / cliSpinners.dots.frames.length);
  }

  let logger: Logger | undefined;
  if (options.verbose) {
    command_helper.renderPipeline(pipeline);
    logger = winston.createLogger({
      level: 'info',
      format: winston.format.printf(({ message }) => message),
      transports: [new winston.transports.Console()],
    });
  }

  return pipeline
    .apply({
      providerStore: command_helper.providerStore,
      logger: logger,
      cwd: path.resolve('./.terraform'),
    })
    .then(async () => {
      // Remove all the environments backed by this datacenter
      for (const env of datacenterEnvs) {
        await command_helper.environmentStore.remove(env.name);
      }

      await command_helper.removeDatacenter(datacenterRecord);
      command_helper.renderPipeline(pipeline, { clear: !options.verbose });
      clearInterval(interval);
      console.log('Datacenter destroyed successfully');
    })
    .catch(async (err) => {
      await command_helper.saveDatacenter(datacenterRecord.name, datacenterRecord.config, pipeline);
      clearInterval(interval);
      console.error(err);
      Deno.exit(1);
    });
}

async function promptForDatacenter(command_helper: CommandHelper, name?: string): Promise<DatacenterRecord> {
  const datacenterRecords = await command_helper.datacenterStore.find();

  if (datacenterRecords.length <= 0) {
    console.error('There are no datacenters to destroy');
    Deno.exit(1);
  }

  let selected = datacenterRecords.find((d) => d.name === name);

  const datacenter = selected ||
    (await Select.prompt({
      message: 'Select a datacenter to destroy',
      options: datacenterRecords.map((r) => r.name),
    }));

  selected = datacenterRecords.find((r) => r.name === datacenter);
  if (!selected) {
    console.log(`Invalid datacenter name: ${selected}`);
    Deno.exit(1);
  }

  return selected;
}

export default DestroyDatacenterCommand;
