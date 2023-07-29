import cliSpinners from 'cli-spinners';
import winston, { Logger } from 'winston';
import { CloudGraph } from '../../cloud-graph/index.ts';
import { DatacenterRecord } from '../../datacenters/index.ts';
import { Environment, parseEnvironment } from '../../environments/index.ts';
import { Pipeline, PlanContext } from '../../pipeline/index.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from '../base-command.ts';
import { Inputs } from '../common/inputs.ts';

type ApplyEnvironmentOptions = {
  datacenter?: string;
  verbose: boolean;
  autoApprove: boolean;
} & GlobalOptions;

const ApplyEnvironmentCommand = BaseCommand()
  .description('create or update an environment')
  .option('-d, --datacenter <datacenter:string>', 'Datacenter for the environment')
  .option('-v, --verbose [verbose:boolean]', 'Verbose output', { default: false })
  .option('--auto-approve [autoApprove:boolean]', 'Skip all prompts and start the requested action', { default: false })
  .arguments(
    '<name:string> [config_path:string]',
  )
  .action(applyEnvironmentAction);

export async function applyEnvironmentAction(options: ApplyEnvironmentOptions, name: string, config_path?: string) {
  const command_helper = new CommandHelper(options);

  const environmentRecord = await command_helper.environmentStore.get(name);
  const notHasDatacenter = !options.datacenter && !environmentRecord;

  const targetDatacenterName = notHasDatacenter
    ? (await promptForDatacenter(command_helper, options.datacenter)).name
    : options.datacenter || environmentRecord?.datacenter;
  const targetDatacenter = targetDatacenterName
    ? await command_helper.datacenterStore.get(targetDatacenterName)
    : undefined;
  if (!targetDatacenter) {
    console.error(`Couldn't find a datacenter named ${targetDatacenterName}`);
    Deno.exit(1);
  }

  let targetEnvironment: Environment | undefined = environmentRecord?.config;
  let targetGraph = new CloudGraph();
  if (config_path) {
    targetEnvironment = await parseEnvironment(config_path);
  }
  if (targetEnvironment) {
    targetGraph = await targetEnvironment.getGraph(name, command_helper.componentStore);
  }

  targetGraph = await targetDatacenter.config.enrichGraph(targetGraph, {
    environmentName: name,
    datacenterName: targetDatacenter.name,
  });
  targetGraph.validate();

  const startingDatacenter = (await command_helper.datacenterStore.get(targetDatacenterName!))!;
  startingDatacenter.config.enrichGraph(targetGraph, {
    environmentName: name,
    datacenterName: targetDatacenter.name,
  });

  const startingPipeline = environmentRecord ? environmentRecord.lastPipeline : targetDatacenter.lastPipeline;

  const pipeline = await Pipeline.plan({
    before: startingPipeline,
    after: targetGraph,
    context: PlanContext.Environment,
  }, command_helper.providerStore);

  pipeline.validate();
  await command_helper.pipelineRenderer.confirmPipeline(pipeline, options.autoApprove);

  let interval: number | undefined = undefined;
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

  const success = await command_helper.environmentUtils.applyEnvironment(
    name,
    startingDatacenter,
    targetEnvironment!,
    pipeline,
    {
      logger,
    },
  );

  if (interval) {
    clearInterval(interval);
  }
  command_helper.pipelineRenderer.renderPipeline(pipeline, { clear: !options.verbose, disableSpinner: true });
  command_helper.pipelineRenderer.doneRenderingPipeline();

  if (!success) {
    console.log(`Environment ${environmentRecord ? 'update' : 'creation'} failed`);
  } else {
    console.log(`Environment ${name} ${environmentRecord ? 'updated' : 'created'} successfully`);
  }
}

async function promptForDatacenter(command_helper: CommandHelper, name?: string): Promise<DatacenterRecord> {
  const datacenterRecords = await command_helper.datacenterStore.find();
  if (datacenterRecords.length <= 0) {
    console.error('No datacenters to create environments in');
    Deno.exit(1);
  }

  let selected = datacenterRecords.find((d) => d.name === name);
  if (!selected) {
    const datacenter = await Inputs.promptSelection({
      message: 'Select a datacenter to host the environment',
      options: datacenterRecords.map((r) => ({
        name: r.name,
        value: r.name,
      })),
    });
    selected = datacenterRecords.find((d) => d.name === datacenter);

    if (!selected) {
      console.log(`Unable to find datacenter: ${datacenter}`);
      Deno.exit(1);
    }
  }

  return selected;
}

export default ApplyEnvironmentCommand;
