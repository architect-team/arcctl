import cliSpinners from 'cli-spinners';
import winston, { Logger } from 'winston';
import { CloudGraph } from '../../cloud-graph/index.ts';
import { parseDatacenter } from '../../datacenters/index.ts';
import { Pipeline } from '../../pipeline/index.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from '../base-command.ts';
import { apply_environment_action } from './environment.ts';

type ApplyDatacenterOptions = {
  verbose?: boolean;
} & GlobalOptions;

const ApplyDatacenterCommand = BaseCommand()
  .description('Create or update a datacenter')
  .option('-v, --verbose [verbose:boolean]', 'Verbose output', { default: false })
  .arguments('<name:string> <config_path:string>')
  .action(apply_datacenter_action);

async function apply_datacenter_action(options: ApplyDatacenterOptions, name: string, config_path: string) {
  const command_helper = new CommandHelper(options);

  const existingDatacenter = await command_helper.datacenterStore.get(name);
  const originalPipeline = existingDatacenter
    ? await command_helper.getPipelineForDatacenter(existingDatacenter)
    : new Pipeline();
  const allEnvironments = await command_helper.environmentStore.find();
  const datacenterEnvironments = existingDatacenter ? allEnvironments.filter((e) => e.datacenter === name) : [];

  try {
    const datacenter = await parseDatacenter(config_path);

    let graph = new CloudGraph();
    const vars = await command_helper.promptForVariables(graph, datacenter.getVariables());
    datacenter.setVariableValues(vars);
    graph = await datacenter.enrichGraph(graph);

    const pipeline = Pipeline.plan({
      before: originalPipeline,
      after: graph,
    }, command_helper.providerStore);

    pipeline.validate();

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

    await command_helper.applyDatacenter(name, datacenter, pipeline, logger);

    if (interval) {
      clearInterval(interval);
    }

    await command_helper.saveDatacenter(name, datacenter, pipeline);
    command_helper.renderPipeline(pipeline, { clear: !options.verbose, disableSpinner: true });
    command_helper.doneRenderingPipeline();
    console.log(`Datacenter ${existingDatacenter ? 'updated' : 'created'} successfully`);

    if (datacenterEnvironments.length > 0) {
      for (const environmet of datacenterEnvironments) {
        await apply_environment_action({
          verbose: options.verbose,
          datacenter: name,
        }, environmet.name);
      }
      console.log('Environments updated successfully');
      command_helper.doneRenderingPipeline();
    }
  } catch (err: any) {
    if (Array.isArray(err)) {
      for (const e of err) {
        console.log(e);
      }
    } else {
      console.error(err);
      Deno.exit(1);
    }
  }
}

export default ApplyDatacenterCommand;
