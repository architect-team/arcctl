import cliSpinners from 'cli-spinners';
import { Confirm, Select } from 'cliffy/prompt/mod.ts';
import winston, { Logger } from 'winston';
import { CloudGraph } from '../../cloud-graph/index.ts';
import { EnvironmentRecord } from '../../environments/index.ts';
import { Pipeline } from '../../pipeline/index.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from '../base-command.ts';

type DestroyResourceOptons = {
  verbose: boolean;
} & GlobalOptions;

export const destroyEnvironment = async (options: DestroyResourceOptons, name: string) => {
  const command_helper = new CommandHelper(options);

  const environmentRecord = await promptForEnvironment(command_helper, name);
  const datacenterRecord = await command_helper.datacenterStore.get(environmentRecord.datacenter);
  if (!datacenterRecord) {
    const confirmed = await Confirm.prompt(
      'The environment is pointed to an invalid datacenter. ' +
        'The environment can be removed, but the resources can\'t be destroyed. Would you like to proceed?',
    );

    if (confirmed) {
      await command_helper.removeEnvironment(datacenterRecord!.config, environmentRecord!);
      console.log(`Environment removed. Resources may still be dangling.`);
      return;
    } else {
      console.log('Environment removal cancelled.');
      return;
    }
  }

  const lastPipeline = await command_helper.getPipelineForEnvironment(environmentRecord);

  const targetGraph = await datacenterRecord?.config.enrichGraph(new CloudGraph());
  const pipeline = Pipeline.plan({
    before: lastPipeline,
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
      logger: logger,
    })
    .toPromise()
    .then(async () => {
      clearInterval(interval);
      await command_helper.removeEnvironment(datacenterRecord.config, environmentRecord);
      command_helper.renderPipeline(pipeline, { clear: !options.verbose });
      command_helper.doneRenderingPipeline();
      console.log(`Environment ${name} destroyed successfully`);
    })
    .catch(async (err) => {
      clearInterval(interval);
      await command_helper.saveEnvironment(
        datacenterRecord.name,
        environmentRecord.name,
        datacenterRecord.config,
        environmentRecord.config!,
        pipeline,
      );
      command_helper.doneRenderingPipeline();
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
  .option('-v, --verbose', 'Turn on verbose logs', { default: false })
  .arguments('<name:string>')
  .action(destroyEnvironment);
