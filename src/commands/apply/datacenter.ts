import cliSpinners from 'cli-spinners';
import winston, { Logger } from 'winston';
import { CloudGraph } from '../../cloud-graph/index.ts';
import { parseDatacenter } from '../../datacenters/index.ts';
import { Pipeline } from '../../pipeline/index.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from '../base-command.ts';
import { apply_environment_action } from './environment.ts';

type ApplyDatacenterOptions = {
  verbose: boolean;
  autoApprove: boolean;
  var?: string[];
} & GlobalOptions;

const ApplyDatacenterCommand = BaseCommand()
  .description('Create or update a datacenter')
  .option('-v, --verbose [verbose:boolean]', 'Verbose output', { default: false })
  .option('--auto-approve [autoApprove:boolean]', 'Skip all prompts and start the requested action', { default: false })
  .option(
    '--var <var:string>',
    'Provide value for a datacenter variable - e.g. --var account=my-account-123 sets the `account` variable',
    { collect: true },
  )
  .arguments('<name:string> <config_path:string>')
  .action(apply_datacenter_action);

async function apply_datacenter_action(options: ApplyDatacenterOptions, name: string, config_path: string) {
  const command_helper = new CommandHelper(options);

  const flag_vars: Record<string, string> = {};
  for (const v of options.var || []) {
    const var_option = v.split('=');
    if (var_option.length !== 2) {
      console.log(`Invalid variable argument: '${v}'. Must be formatted: VAR_NAME=VAR_VALUE`);
      Deno.exit(1);
    }
    flag_vars[var_option[0]] = var_option[1];
  }

  const existingDatacenter = await command_helper.datacenterStore.get(name);
  const originalPipeline = existingDatacenter ? existingDatacenter.lastPipeline : new Pipeline();
  const allEnvironments = await command_helper.environmentStore.find();
  const datacenterEnvironments = existingDatacenter ? allEnvironments.filter((e) => e.datacenter === name) : [];

  try {
    const datacenter = await parseDatacenter(config_path);

    let graph = new CloudGraph();
    const vars = await command_helper.datacenterUtils.promptForVariables(graph, datacenter.getVariables(), flag_vars);
    datacenter.setVariableValues(vars);
    graph = await datacenter.enrichGraph(graph);

    const pipeline = await Pipeline.plan({
      before: originalPipeline,
      after: graph,
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

    command_helper.datacenterUtils.applyDatacenter(name, datacenter, pipeline, logger)
      .then(async () => {
        console.log(`Datacenter ${existingDatacenter ? 'updated' : 'created'} successfully`);
        if (datacenterEnvironments.length > 0) {
          for (const environmet of datacenterEnvironments) {
            await apply_environment_action({
              verbose: options.verbose,
              datacenter: name,
              autoApprove: true,
            }, environmet.name);
          }
          console.log('Environments updated successfully');
          command_helper.pipelineRenderer.doneRenderingPipeline();
        }
      }).catch((err) => {
        console.error(err);
        Deno.exit(1);
      }).finally(async () => {
        if (interval) {
          clearInterval(interval);
          await command_helper.datacenterUtils.saveDatacenter(name, datacenter, pipeline);
          command_helper.pipelineRenderer.renderPipeline(pipeline, { clear: !options.verbose, disableSpinner: true });
          command_helper.pipelineRenderer.doneRenderingPipeline();
        }
      });
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
