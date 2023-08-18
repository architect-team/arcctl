import cliSpinners from 'cli-spinners';
import { Select } from 'cliffy/prompt/mod.ts';
import winston, { Logger } from 'winston';
import { CloudGraph } from '../../cloud-graph/index.ts';
import { DatacenterRecord } from '../../datacenters/index.ts';
import { Pipeline, PlanContext } from '../../pipeline/index.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from '../base-command.ts';
import { destroyEnvironment } from './environment.ts';

type DestroyDatacenterOptions = {
  verbose: boolean;
  autoApprove: boolean;
} & GlobalOptions;

const DestroyDatacenterCommand = BaseCommand()
  .description('Destroy a datacenter and all the environments managed by it')
  .option('-v, --verbose [verbose:boolean]', 'Turn on verbose logs', { default: false })
  .option('--auto-approve [autoApprove:boolean]', 'Skip all prompts and start the requested action', { default: false })
  .arguments('<name:string>')
  .action(destroy_datacenter_action);

async function destroy_datacenter_action(options: DestroyDatacenterOptions, name: string) {
  const command_helper = new CommandHelper(options);

  const datacenterRecord = await promptForDatacenter(command_helper, name);
  const lastPipeline = datacenterRecord.lastPipeline;
  const pipeline = await Pipeline.plan({
    before: lastPipeline,
    after: new CloudGraph(),
    context: PlanContext.Datacenter,
  }, command_helper.providerStore);

  const allEnvs = await command_helper.environmentStore.find();
  const datacenterEnvs = allEnvs.filter((env) => env.datacenter === datacenterRecord.name);

  if (datacenterEnvs.length > 0) {
    console.log('This will also destroy all the following environments:');
    for (const env of datacenterEnvs) {
      console.log(`- ${env.name}`);
    }
  }

  await command_helper.pipelineRenderer.confirmPipeline(pipeline, options.autoApprove);

  for (const env of datacenterEnvs) {
    await destroyEnvironment({
      verbose: options.verbose,
      autoApprove: true,
    }, env.name);
  }

  let interval: number;
  if (!options.verbose) {
    interval = setInterval(() => {
      command_helper.pipelineRenderer.renderPipeline(pipeline, { clear: true });
    }, 1000 / cliSpinners.dots.frames.length);
  }

  let logger: Logger | undefined;
  if (options.verbose) {
    command_helper.pipelineRenderer.renderPipeline(pipeline);
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
    })
    .toPromise()
    .then(async () => {
      clearInterval(interval);
      await command_helper.datacenterUtils.removeDatacenter(datacenterRecord);
      command_helper.pipelineRenderer.renderPipeline(pipeline, { clear: !options.verbose, disableSpinner: true });
      command_helper.pipelineRenderer.doneRenderingPipeline();
      clearInterval(interval);
      console.log(`Datacenter ${name} destroyed successfully`);
    })
    .catch(async (err) => {
      clearInterval(interval);
      await command_helper.datacenterUtils.saveDatacenter(datacenterRecord.name, datacenterRecord.config, pipeline);
      command_helper.pipelineRenderer.doneRenderingPipeline();
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
  if (!selected) {
    const selectedName = await Select.prompt({
      message: 'Select a datacenter to destroy',
      options: datacenterRecords.map((r) => r.name),
    });
    selected = datacenterRecords.find((d) => d.name === selectedName);
  }

  if (!selected) {
    console.log(`Invalid datacenter name: ${selected}`);
    Deno.exit(1);
  }

  return selected;
}

export default DestroyDatacenterCommand;
