import cliSpinners from 'cli-spinners';
import * as path from 'std/path/mod.ts';
import winston, { Logger } from 'winston';
import { Datacenter, parseDatacenter } from '../../datacenters/index.ts';
import { AppGraph, InfraGraph, PlanContext } from '../../graphs/index.ts';
import { pathExistsSync } from '../../utils/filesystem.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from '../base-command.ts';
import { applyEnvironment } from './utils.ts';

type ApplyDatacenterOptions = {
  verbose: boolean;
  autoApprove: boolean;
  var?: string[];
  concurrency: number;
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
  .option('-c, --concurrency <concurrency:number>', 'Maximum number of nodes to apply concurrently', { default: 1 })
  .arguments('<name:string> <config_path:string>')
  .action(apply_datacenter_action);

async function buildDatacenterFromConfig(
  command_helper: CommandHelper,
  config_path: string,
  logger?: Logger,
): Promise<Datacenter> {
  const datacenter = await parseDatacenter(path.resolve(config_path));
  return command_helper.datacenterUtils.buildDatacenter(datacenter, path.resolve(config_path), logger);
}

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

  const envs = Deno.env.toObject();
  for (const key of Object.keys(envs)) {
    if (key.startsWith('ARC_')) {
      flag_vars[key.replace('ARC_', '')] = envs[key];
    }
  }

  const existingDatacenter = await command_helper.datacenterStore.get(name);
  const priorState = existingDatacenter ? existingDatacenter.priorState : new InfraGraph();
  const allEnvironments = await command_helper.environmentStore.find();
  const datacenterEnvironments = existingDatacenter ? allEnvironments.filter((e) => e.datacenter === name) : [];

  const logger = options.verbose
    ? winston.createLogger({
      level: 'info',
      format: winston.format.printf(({ message }) => message),
      transports: [new winston.transports.Console()],
    })
    : undefined;

  try {
    const datacenter = pathExistsSync(config_path)
      ? await buildDatacenterFromConfig(command_helper, config_path, logger)
      : await command_helper.datacenterStore.getDatacenter(config_path);

    const vars = await command_helper.datacenterUtils.promptForVariables(datacenter.getVariablesSchema(), flag_vars);

    const targetState = datacenter.getGraph(new AppGraph(), {
      datacenterName: name,
      variables: vars,
    });

    const infraGraph = await InfraGraph.plan({
      before: priorState,
      after: targetState,
      context: PlanContext.Datacenter,
    });

    infraGraph.validate();
    await command_helper.infraRenderer.confirmGraph(infraGraph, options.autoApprove);

    let interval: number | undefined = undefined;
    if (!logger) {
      interval = setInterval(() => {
        command_helper.infraRenderer.renderGraph(infraGraph, { clear: true });
      }, 1000 / cliSpinners.dots.frames.length);
    } else {
      command_helper.infraRenderer.renderGraph(infraGraph);
    }

    command_helper.datacenterUtils.applyDatacenter(name, datacenter, infraGraph, logger, options.concurrency)
      .then(async () => {
        if (interval) {
          clearInterval(interval);
          command_helper.infraRenderer.renderGraph(infraGraph, { clear: !logger, disableSpinner: true });
          command_helper.infraRenderer.doneRenderingGraph();
        }

        await command_helper.datacenterUtils.saveDatacenter(name, datacenter, infraGraph);
        console.log(`Datacenter ${existingDatacenter ? 'updated' : 'created'} successfully`);

        if (datacenterEnvironments.length > 0) {
          for (const environmentRecord of datacenterEnvironments) {
            console.log(`Updating environment ${environmentRecord.name}`);
            const { success } = await applyEnvironment({
              command_helper,
              name: environmentRecord.name,
              logger,
              autoApprove: true,
              targetEnvironment: environmentRecord.config,
            });

            if (success) {
              console.log(`Environment ${environmentRecord.name} updated successfully`);
            } else {
              console.error(`%cEnvironment ${environmentRecord.name} update failed`, 'color: red');
            }
          }
          command_helper.infraRenderer.doneRenderingGraph();
        }
      }).catch(async (err) => {
        console.error(err);
        await command_helper.datacenterUtils.saveDatacenter(name, datacenter, infraGraph);
        Deno.exit(1);
      });
  } catch (err: any) {
    if (Array.isArray(err)) {
      for (const e of err) {
        console.log(e);
      }
      Deno.exit(1);
    } else {
      console.error(err);
      Deno.exit(1);
    }
  }
}

export default ApplyDatacenterCommand;
