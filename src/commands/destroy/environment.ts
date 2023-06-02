import { BaseCommand, CommandHelper, GlobalOptions } from '../base-command.ts';
import { CloudGraph } from '../../cloud-graph/index.ts';
import { EnvironmentRecord } from '../../environments/index.ts';
import { Pipeline } from '../../pipeline/index.ts';
import cliSpinners from 'cli-spinners';
import inquirer from 'inquirer';
import * as path from 'std/path/mod.ts';
import winston, { Logger } from 'winston';

type DestroyResourceOptons = {
  verbose: boolean;
} & GlobalOptions;

const DestroyEnvironmentCommand = BaseCommand()
  .description('Destroy all the resources in the specified environment')
  .option('-v, --verbose', 'Turn on verbose logs', { default: false })
  .arguments('[name:string]')
  .action(destroy_environment_action);

async function destroy_environment_action(options: DestroyResourceOptons, name?: string) {
  const command_helper = new CommandHelper(options);

  const environmentRecord = await promptForEnvironment(command_helper, name);
  const datacenterRecord = await command_helper.datacenterStore.get(environmentRecord.datacenter);
  if (!datacenterRecord) {
    const { confirm } = await inquirer.prompt([
      {
        name: 'confirm',
        type: 'confirm',
        message: `The environment is pointed to an invalid datacenter. The environment can be removed, but the resources can't be destroyed. Would you like to proceed?`,
      },
    ]);

    if (confirm) {
      await command_helper.environmentStore.remove(environmentRecord.name);
      console.log(`Environment removed. Resources may still be dangling.`);
      return;
    } else {
      console.log('Environment removal cancelled.');
      return;
    }
  }

  const lastPipeline = await command_helper.getPipelineForDatacenter(datacenterRecord);

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
      cwd: path.resolve('./.terraform'),
    })
    .then(async () => {
      await command_helper.saveDatacenter(datacenterRecord.name, datacenterRecord.config, pipeline);
      await command_helper.environmentStore.remove(environmentRecord.name);
      command_helper.renderPipeline(pipeline, { clear: !options.verbose });
      clearInterval(interval);
      console.log('Environment destroyed successfully');
    })
    .catch(async (err) => {
      await command_helper.saveDatacenter(datacenterRecord.name, datacenterRecord.config, pipeline);
      clearInterval(interval);
      console.error(err);
      Deno.exit(1);
    });
}

async function promptForEnvironment(command_helper: CommandHelper, name?: string): Promise<EnvironmentRecord> {
  const environmentRecords = await command_helper.environmentStore.find();

  if (environmentRecords.length <= 0) {
    console.error('There are no environments to destroy');
    Deno.exit(1);
  }

  const selected = environmentRecords.find((r) => r.name === name);
  const { environment } = await inquirer.prompt(
    [
      {
        name: 'environment',
        type: 'list',
        message: 'Select an environment to destroy',
        choices: environmentRecords.map((r) => ({
          name: r.name,
          value: r,
        })),
      },
    ],
    { environment: selected },
  );

  return environment;
}

export default DestroyEnvironmentCommand;
