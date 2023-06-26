import cliSpinners from 'cli-spinners';
import winston, { Logger } from 'winston';
import { CloudGraph } from '../../cloud-graph/index.ts';
import { Environment, parseEnvironment } from '../../environments/index.ts';
import { Pipeline } from '../../pipeline/index.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from '../base-command.ts';

type UpdateEnvironmentOptions = {
  datacenter?: string;
  verbose?: boolean;
} & GlobalOptions;

const UpdateEnvironmentCommand = BaseCommand()
  .alias('update env')
  .description('Apply changes to an environment')
  .option('-d, --datacenter <datacenter:string>', 'New datacenter for the environment')
  .option('-v, --verbose', 'Turn on verbose logs')
  .arguments('<name:string> [config_path:string]')
  .action(update_environment_action);

export async function update_environment_action(options: UpdateEnvironmentOptions, name: string, config_path?: string) {
  const command_helper = new CommandHelper(options);

  const environmentRecord = await command_helper.environmentStore.get(name);
  if (!options.datacenter && !environmentRecord) {
    console.error(`A datacenter must be specified for new environments`);
    Deno.exit(1);
  }

  const targetDatacenterName = options.datacenter || environmentRecord?.datacenter;
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

  targetGraph = await targetDatacenter.config.enrichGraph(targetGraph, name);
  targetGraph.validate();

  const startingDatacenter = (await command_helper.datacenterStore.get(environmentRecord!.datacenter))!;
  startingDatacenter.config.enrichGraph(targetGraph, name);

  const startingPipeline = await command_helper.getPipelineForEnvironment(environmentRecord!);

  const pipeline = Pipeline.plan({
    before: startingPipeline,
    after: targetGraph,
  });

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
    environmentRecord!,
    targetEnvironment!,
    pipeline,
    logger,
  );

  if (interval) {
    clearInterval(interval);
  }
  command_helper.renderPipeline(pipeline, { clear: !options.verbose });
  command_helper.doneRenderingPipeline();
  console.log(`Environment ${name} updated successfully`);
}

export default UpdateEnvironmentCommand;
