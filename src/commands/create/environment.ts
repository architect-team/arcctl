import { BaseCommand, CommandHelper, GlobalOptions } from '../base-command.ts';
import { CloudGraph } from '../../cloud-graph/index.ts';
import { DatacenterRecord } from '../../datacenters/index.ts';
import { Environment, parseEnvironment } from '../../environments/index.ts';
import { Pipeline } from '../../pipeline/index.ts';
import cliSpinners from 'cli-spinners';
import * as path from 'std/path/mod.ts';
import winston, { Logger } from 'winston';
import { Select } from 'cliffy/prompt/mod.ts';

type CreateEnvironmentOptions = {
  datacenter?: string;
  verbose?: boolean;
} & GlobalOptions;

const CreateEnvironmentCommand = BaseCommand()
  .description('Create a new environment')
  .option('-d, --datacenter <datacenter:string>', 'Name of the datacenter to create the environment on')
  .option('-v, --verbose', 'Turn on verbose logs')
  .arguments('<name:string> [config_path:string]')
  .action(create_environment_action);

async function create_environment_action(options: CreateEnvironmentOptions, name: string, config_path?: string) {
  const command_helper = new CommandHelper(options);

  const existing = await command_helper.environmentStore.get(name);
  if (existing) {
    console.error(`An environment named ${name} already exists`);
    Deno.exit(1);
  }

  try {
    const datacenterRecord = await promptForDatacenter(command_helper, options.datacenter);
    const lastPipeline = await command_helper.getPipelineForDatacenter(datacenterRecord);

    let environment: Environment | undefined;
    let environmentGraph = new CloudGraph();
    if (config_path) {
      environment = await parseEnvironment(config_path);
      environmentGraph = await environment.getGraph(name, command_helper.componentStore);
    }

    const targetGraph = await datacenterRecord.config.enrichGraph(environmentGraph, name);

    const pipeline = Pipeline.plan({
      before: lastPipeline,
      after: targetGraph,
    });

    pipeline.validate();

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
        cwd: path.resolve(path.join('./.terraform', datacenterRecord.name)),
      })
      .then(async () => {
        await command_helper.saveDatacenter(datacenterRecord.name, datacenterRecord.config, pipeline);
        await command_helper.environmentStore.save({
          datacenter: datacenterRecord.name,
          name: name,
          config: environment,
        });
        command_helper.renderPipeline(pipeline, { clear: !options.verbose });
        clearInterval(interval);
        console.log('Environment created successfully');
      })
      .catch(async (err) => {
        await command_helper.saveDatacenter(datacenterRecord.name, datacenterRecord.config, pipeline);
        command_helper.renderPipeline(pipeline, { clear: !options.verbose });
        clearInterval(interval);
        console.error(err);
        Deno.exit(1);
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

async function promptForDatacenter(command_helper: CommandHelper, name?: string): Promise<DatacenterRecord> {
  const datacenterRecords = await command_helper.datacenterStore.find();
  if (datacenterRecords.length <= 0) {
    console.error('No datacenters to create environments in');
    Deno.exit(1);
  }

  let selected = datacenterRecords.find((d) => d.name === name);
  // { datacenter: selected },
  if (!selected) {
    const datacenter = await Select.prompt({
      message: 'Select a datacenter to host the environment',
      options: datacenterRecords.map((r) => ({
        name: r.name,
        value: r.name,
      })),
    });
    selected = datacenterRecords.find((d) => d.name === datacenter);

    if (!selected) {
      console.log(`Unable to find datacenter: ${datacenter}`);
      Deno.exit(1);
    }
  }

  return selected;
}

export default CreateEnvironmentCommand;
