import cliSpinners from 'cli-spinners';
import winston, { Logger } from 'winston';
import { parseEnvironment } from '../environments/index.ts';
import { InfraGraph, PlanContext } from '../graphs/index.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from './base-command.ts';

type RemoveOptions = {
  environment?: string[];
  verbose: boolean;
  autoApprove: boolean;
  refresh: boolean;
  concurrency: number;
} & GlobalOptions;

const RemoveCommand = BaseCommand()
  .name('remove')
  .alias('rm')
  .description('Remove a component from an environment')
  .arguments('<name:string>') // 'Component tag to remove from the environment'
  .option('-e, --environment <environment:string>', 'Environments to remove the component from', {
    collect: true,
  })
  .option('-v, --verbose [verbose:boolean]', 'Turn on verbose logs', { default: false })
  .option('-r, --refresh [refresh:boolean]', 'Force update all resources', { default: false })
  .option('-c, --concurrency <concurrency:number>', 'Maximum number of nodes to apply concurrently', { default: 10 })
  .option('--auto-approve [autoApprove:boolean]', 'Skip all prompts and start the requested action', { default: false })
  .action(remove_action);

async function remove_action(options: RemoveOptions, name: string): Promise<void> {
  const command_helper = new CommandHelper(options);

  try {
    if (!options.environment || options.environment.length <= 0) {
      console.error('Must specify at least one environment to remove the component from');
      Deno.exit(1);
    }

    for (const environment_name of options.environment || []) {
      const environmentRecord = await command_helper.environmentStore.get(environment_name);
      if (!environmentRecord) {
        console.error(`Invalid environment name: ${environment_name}`);
        Deno.exit(1);
      }

      const datacenterRecord = await command_helper.datacenterStore.get(environmentRecord.datacenter);
      if (!datacenterRecord) {
        console.error(`Invalid datacenter associated with environment: ${environmentRecord.datacenter}`);
        Deno.exit(1);
      }

      const priorInfraGraph = environmentRecord.priorState;

      const environment = environmentRecord.config || await parseEnvironment({});
      environment.removeComponent(name);

      const targetGraph = datacenterRecord.config.getGraph(
        await environment.getGraph(environmentRecord.name, command_helper.componentStore),
        {
          environmentName: environmentRecord.name,
          datacenterName: datacenterRecord.name,
        },
      );

      const pipeline = await InfraGraph.plan({
        before: priorInfraGraph,
        after: targetGraph,
        context: PlanContext.Component,
        refresh: options.refresh,
      });
      pipeline.validate();
      await command_helper.infraRenderer.confirmGraph(pipeline, options.autoApprove);

      let interval: number;
      if (!options.verbose) {
        interval = setInterval(() => {
          command_helper.infraRenderer.renderGraph(pipeline, {
            clear: true,
            message: `Removing ${name} from ${environmentRecord.name}`,
          });
        }, 1000 / cliSpinners.dots.frames.length);
      }

      let logger: Logger | undefined;
      if (options.verbose) {
        command_helper.infraRenderer.renderGraph(pipeline);
        logger = winston.createLogger({
          level: 'info',
          format: winston.format.printf(({ message }) => message),
          transports: [new winston.transports.Console()],
        });
      }

      await pipeline
        .apply({ logger, concurrency: options.concurrency })
        .toPromise()
        .then(async () => {
          await command_helper.environmentUtils.saveEnvironment(
            datacenterRecord.name,
            environmentRecord.name,
            environment,
            pipeline,
          );
          command_helper.infraRenderer.renderGraph(pipeline, {
            clear: !options.verbose,
            disableSpinner: true,
            message: `Removing ${name} from ${environmentRecord.name}`,
          });
          clearInterval(interval);
        })
        .catch(async (err) => {
          await command_helper.environmentUtils.saveEnvironment(
            datacenterRecord.name,
            environmentRecord.name,
            environment,
            pipeline,
          );
          command_helper.infraRenderer.renderGraph(pipeline, {
            clear: !options.verbose,
            disableSpinner: true,
            message: `Removing ${name} from ${environmentRecord.name}`,
          });
          clearInterval(interval);
          console.error(err);
          Deno.exit(1);
        });
    }
  } catch (err: any) {
    console.error(err);
    Deno.exit(1);
  }
}
export default RemoveCommand;
