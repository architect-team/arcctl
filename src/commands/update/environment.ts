import cliSpinners from 'cli-spinners';
import * as path from 'std/path/mod.ts';
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

async function update_environment_action(options: UpdateEnvironmentOptions, name: string, config_path?: string) {
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

  let startingPipeline = new Pipeline();
  if (environmentRecord?.datacenter) {
    const startingDatacenter = await command_helper.datacenterStore.get(environmentRecord.datacenter);
    if (startingDatacenter) {
      startingPipeline = await command_helper.getPipelineForDatacenter(startingDatacenter);
    }
  }

  const pipeline = Pipeline.plan({
    before: startingPipeline,
    after: targetGraph,
  });

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
      cwd: path.resolve(path.join('./.terraform', targetDatacenter.name)),
      logger,
    })
    .then(async () => {
      await command_helper.saveDatacenter(targetDatacenter.name, targetDatacenter.config, pipeline);
      await command_helper.environmentStore.save({
        name: name,
        datacenter: targetDatacenter.name,
        config: targetEnvironment,
      });
      command_helper.renderPipeline(pipeline, { clear: !options.verbose });
      clearInterval(interval);
      console.log('Environment updated successfully');
    })
    .catch(async (err) => {
      await command_helper.saveDatacenter(targetDatacenter.name, targetDatacenter.config, pipeline);
      command_helper.renderPipeline(pipeline, { clear: !options.verbose });
      clearInterval(interval);
      console.error(err);
      Deno.exit(1);
    });
}

export default UpdateEnvironmentCommand;
