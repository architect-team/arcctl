import cliSpinners from 'cli-spinners';
import winston, { Logger } from 'winston';
import { CloudGraph } from '../../cloud-graph/index.ts';
import { parseDatacenter } from '../../datacenters/index.ts';
import { Pipeline } from '../../pipeline/index.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from '../base-command.ts';

type CreateDatacenterOptions = {
  verbose?: boolean;
} & GlobalOptions;

const CreateDatacenterCommand = BaseCommand()
  .description('Create a new datacenter')
  .option('-v, --verbose [verbose:boolean]', 'Verbose output', { default: false })
  .arguments('<name:string> <config_path:string>')
  .action(create_datacenter_action);

async function create_datacenter_action(options: CreateDatacenterOptions, name: string, config_path: string) {
  const command_helper = new CommandHelper(options);

  const existingDatacenter = await command_helper.datacenterStore.get(name);
  if (existingDatacenter) {
    console.error(`A datacenter named ${name} already exists`);
    Deno.exit(1);
  }

  try {
    const datacenter = await parseDatacenter(config_path);

    let graph = new CloudGraph();
    const vars = await command_helper.promptForVariables(graph, datacenter.getVariables());
    datacenter.setVariableValues(vars);
    graph = await datacenter.enrichGraph(new CloudGraph());

    const pipeline = Pipeline.plan({
      before: new Pipeline(),
      after: graph,
    });

    pipeline.validate();

    if (pipeline.steps.length <= 0) {
      await command_helper.saveDatacenter(name, datacenter, pipeline);
      console.log('Datacenter created successfully');
    }

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
      .then(async () => {
        await command_helper.saveDatacenter(name, datacenter, pipeline);
        command_helper.renderPipeline(pipeline, { clear: !options.verbose });
        clearInterval(interval);
        console.log('Datacenter created successfully');
      })
      .catch(async (err) => {
        await command_helper.saveDatacenter(name, datacenter, pipeline);
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

export default CreateDatacenterCommand;
