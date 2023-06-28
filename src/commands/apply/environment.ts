import cliSpinners from 'cli-spinners';
import { Select } from 'cliffy/prompt/mod.ts';
import winston, { Logger } from 'winston';
import { CloudGraph } from '../../cloud-graph/index.ts';
import { DatacenterRecord } from '../../datacenters/index.ts';
import { Environment, parseEnvironment } from '../../environments/index.ts';
import { Pipeline, PlanContextLevel } from '../../pipeline/index.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from '../base-command.ts';

type ApplyEnvironmentOptions = {
  datacenter?: string;
  verbose?: boolean;
} & GlobalOptions;

const ApplyEnvironmentCommand = BaseCommand()
  .description('create or update an environment')
  .option('-d, --datacenter <datacenter:string>', 'Datacenter for the environment')
  .option('-v, --verbose', 'Turn on verbose logs')
  .arguments('<name:string> [config_path:string]')
  .action(apply_environment_action);

export async function apply_environment_action(options: ApplyEnvironmentOptions, name: string, config_path?: string) {
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

  let targetEnvironment: Environment | undefined;
  let targetGraph = new CloudGraph();
  if (config_path) {
    targetEnvironment = await parseEnvironment(config_path);
    targetGraph = await targetEnvironment.getGraph(name, command_helper.componentStore);
  }

  targetGraph = await targetDatacenter.config.enrichGraph(targetGraph, {
    environmentName: name,
  });
  targetGraph.validate();

  const startingDatacenter = (await command_helper.datacenterStore.get(targetDatacenterName!))!;
  startingDatacenter.config.enrichGraph(targetGraph, {
    environmentName: name,
  });

  const startingPipeline = environmentRecord
    ? await command_helper.getPipelineForEnvironment(environmentRecord)
    : await command_helper.getPipelineForDatacenter(targetDatacenter);

  const pipeline = Pipeline.plan({
    before: startingPipeline,
    after: targetGraph,
    contextFilter: PlanContextLevel.Environment,
  }, command_helper.providerStore);

  let interval: number | undefined = undefined;
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

  await command_helper.applyEnvironment(
    name,
    startingDatacenter,
    targetEnvironment!,
    pipeline,
    logger,
  );

  if (interval) {
    clearInterval(interval);
  }
  command_helper.renderPipeline(pipeline, { clear: !options.verbose, disableSpinner: true });
  command_helper.doneRenderingPipeline();
  console.log(`Environment ${name} ${environmentRecord ? 'updated' : 'created'} successfully`);
}

async function promptForDatacenter(command_helper: CommandHelper, name?: string): Promise<DatacenterRecord> {
  const datacenterRecords = await command_helper.datacenterStore.find();
  if (datacenterRecords.length <= 0) {
    console.error('No datacenters to create environments in');
    Deno.exit(1);
  }

  let selected = datacenterRecords.find((d) => d.name === name);
  if (!selected) {
    const datacenter = await Select.prompt({
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
