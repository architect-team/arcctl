import cliSpinners from 'cli-spinners';
import { Confirm, Select } from 'cliffy/prompt/mod.ts';
import winston, { Logger } from 'winston';
import { DatacenterRecord } from '../../datacenters/index.ts';
import { InfraGraph, PlanContext } from '../../graphs/index.ts';
import ArcctlConfig from '../../utils/config.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from '../base-command.ts';
import { Inputs } from '../common/inputs.ts';
import { destroyEnvironment } from './environment.ts';

type DestroyDatacenterOptions = {
  verbose: boolean;
  autoApprove: boolean;
  force: boolean;
  concurrency: number;
} & GlobalOptions;

const DestroyDatacenterCommand = BaseCommand()
  .description('Destroy a datacenter and all the environments managed by it')
  .option('-v, --verbose [verbose:boolean]', 'Turn on verbose logs', { default: false })
  .option('--auto-approve [autoApprove:boolean]', 'Skip all prompts and start the requested action', { default: false })
  .option(
    '--force [force:boolean]',
    'Destroy the datacenter store record, even if destruction of the datacenter fails',
    { default: false },
  )
  .option('-c, --concurrency <concurrency:number>', 'Maximum number of nodes to apply concurrently', { default: 1 })
  .arguments('[name:string]')
  .action(destroy_datacenter_action);

async function destroy_datacenter_action(options: DestroyDatacenterOptions, name?: string) {
  const command_helper = new CommandHelper(options);

  const datacenterRecord = await promptForDatacenter(command_helper, name);
  if (!name) {
    name = datacenterRecord.name;
  }

  const defaultDatacenter = await ArcctlConfig.getDefaultDatacenter(command_helper);
  if (defaultDatacenter && defaultDatacenter.name === name) {
    const answer = options.autoApprove || await Confirm.prompt(
      `${name} is set as the default datacenter. Are you sure you want to destroy it?`,
    );
    if (!answer) {
      console.log(`Not destroying datacenter: ${name}`);
      Deno.exit(0);
    } else {
      console.log(`Unset default datacenter: ${name}`);
      ArcctlConfig.setDefaultDatacenter(undefined);
    }
  }

  const lastGraph = datacenterRecord.priorState;
  const graph = await InfraGraph.plan({
    before: lastGraph,
    after: new InfraGraph(),
    context: PlanContext.Datacenter,
  });

  const allEnvs = await command_helper.environmentStore.find();
  const datacenterEnvs = allEnvs.filter((env) => env.datacenter === datacenterRecord.name);

  command_helper.infraRenderer.renderGraph(graph);

  if (datacenterEnvs.length > 0) {
    console.log('This will also destroy all the following environments:');
    for (const env of datacenterEnvs) {
      console.log(`- ${env.name}`);
    }
    const confirm = options.autoApprove || (await Inputs.promptForContinuation('Are you sure you want to proceed?'));
    if (!confirm) {
      console.error('Datacenter destruction cancelled');
      Deno.exit(1);
    }

    for (const env of datacenterEnvs) {
      await destroyEnvironment({
        verbose: options.verbose,
        autoApprove: true,
        concurrency: options.concurrency,
      }, env.name);
    }
  } else {
    await command_helper.infraRenderer.confirmGraph(graph, options.autoApprove);
  }
  let interval: number;
  if (!options.verbose) {
    interval = setInterval(() => {
      command_helper.infraRenderer.renderGraph(graph, { clear: true });
    }, 1000 / cliSpinners.dots.frames.length);
  }

  let logger: Logger | undefined;
  if (options.verbose) {
    command_helper.infraRenderer.renderGraph(graph);
    logger = winston.createLogger({
      level: 'info',
      format: winston.format.printf(({ message }) => message),
      transports: [new winston.transports.Console()],
    });
  }

  return graph
    .apply({
      logger: logger,
      concurrency: options.concurrency,
    })
    .toPromise()
    .then(async () => {
      clearInterval(interval);
      await command_helper.datacenterUtils.removeDatacenter(datacenterRecord);
      command_helper.infraRenderer.renderGraph(graph, { clear: !options.verbose, disableSpinner: true });
      command_helper.infraRenderer.doneRenderingGraph();
      clearInterval(interval);
      console.log(`Datacenter ${name} destroyed successfully`);
    })
    .catch(async (err) => {
      clearInterval(interval);
      if (options.force) {
        await command_helper.datacenterUtils.removeDatacenter(datacenterRecord);
        console.log(`Datacenter record for ${name} destroyed successfully`);
      } else {
        await command_helper.datacenterUtils.saveDatacenter(datacenterRecord.name, datacenterRecord.config, graph);
      }
      command_helper.infraRenderer.doneRenderingGraph();
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
