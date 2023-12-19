import cliSpinners from 'cli-spinners';
import { Select } from 'cliffy/prompt/mod.ts';
import winston, { Logger } from 'winston';
import { EnvironmentRecord } from '../../environments/index.ts';
import { AppGraph, InfraGraph, PlanContext } from '../../graphs/index.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from '../base-command.ts';
import { Inputs } from '../common/inputs.ts';

type DestroyResourceOptons = {
  verbose: boolean;
  autoApprove: boolean;
  concurrency: number;
} & GlobalOptions;

export const destroyEnvironment = async (options: DestroyResourceOptons, name: string) => {
  const command_helper = new CommandHelper(options);

  const environmentRecord = await promptForEnvironment(command_helper, name);
  const datacenterRecord = await command_helper.datacenterStore.get(environmentRecord.datacenter);
  if (!datacenterRecord) {
    const confirmed = options.autoApprove || await Inputs.promptForContinuation(
      'The environment is pointed to an invalid datacenter. ' +
        'The environment can be removed, but the resources can\'t be destroyed. Would you like to proceed?',
    );

    if (confirmed) {
      // TODO: This won't work. Need to change how we remove environments when we don't have a datacenter
      await command_helper.environmentUtils.removeEnvironment(
        environmentRecord.name,
        datacenterRecord!.name,
        datacenterRecord!.config,
      );
      console.log(`Environment removed. Resources may still be dangling.`);
      return;
    } else {
      console.log('Environment removal cancelled.');
      return;
    }
  }

  const lastPipeline = environmentRecord.priorState;
  const targetGraph = datacenterRecord.config.getGraph(new AppGraph(), {
    datacenterName: datacenterRecord.name,
  });
  const graph = await InfraGraph.plan({
    before: lastPipeline,
    after: targetGraph,
    context: PlanContext.Environment,
  });

  graph.validate();

  await command_helper.infraRenderer.confirmGraph(graph, options.autoApprove);

  let interval: number;
  if (!options.verbose) {
    interval = setInterval(() => {
      command_helper.infraRenderer.renderGraph(graph, { clear: true });
    }, 1000 / cliSpinners.dots.frames.length);
  }

  let logger: Logger | undefined;
  if (options.verbose) {
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
      await command_helper.environmentUtils.removeEnvironment(
        environmentRecord.name,
        datacenterRecord.name,
        datacenterRecord.config,
      );
      command_helper.infraRenderer.renderGraph(graph, { clear: !options.verbose, disableSpinner: true });
      command_helper.infraRenderer.doneRenderingGraph();
      console.log(`Environment ${name} destroyed successfully`);
    })
    .catch(async (err) => {
      clearInterval(interval);
      await command_helper.environmentUtils.saveEnvironment(
        datacenterRecord.name,
        environmentRecord.name,
        environmentRecord.config!,
        graph,
      );
      command_helper.infraRenderer.doneRenderingGraph();
      console.error(err);
      Deno.exit(1);
    });
};

async function promptForEnvironment(command_helper: CommandHelper, name?: string): Promise<EnvironmentRecord> {
  const environmentRecords = await command_helper.environmentStore.find();

  if (environmentRecords.length <= 0) {
    console.error('There are no environments to destroy');
    Deno.exit(1);
  }

  let selected = environmentRecords.find((r) => r.name === name);
  if (!selected) {
    const selectedName = await Select.prompt({
      message: 'Select an environment to destroy',
      options: environmentRecords.map((r) => r.name),
    });
    selected = environmentRecords.find((r) => r.name === selectedName);
  }

  if (!selected) {
    console.log(`Invalid environment name: ${selected}`);
    Deno.exit(1);
  }

  return selected;
}

export default BaseCommand()
  .description('Destroy all the resources in the specified environment')
  .option('-v, --verbose [verbose:boolean]', 'Turn on verbose logs', { default: false })
  .option('--auto-approve [autoApprove:boolean]', 'Skip all prompts and start the requested action', { default: false })
  .option('-c, --concurrency <concurrency:number>', 'Maximum number of nodes to apply concurrently', { default: 10 })
  .arguments('<name:string>')
  .action(destroyEnvironment);
