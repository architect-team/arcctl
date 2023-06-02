import { BaseCommand, CommandHelper, GlobalOptions } from '../base-command.ts';
import { CloudGraph } from '../../cloud-graph/index.ts';
import { parseDatacenter } from '../../datacenters/index.ts';
import { Pipeline } from '../../pipeline/index.ts';
import cliSpinners from 'cli-spinners';
import * as path from 'std/path/mod.ts';
import winston, { Logger } from 'winston';

type UpdateDatacenterOptions = {
  verbose: boolean;
} & GlobalOptions;

const UpdateDatacenterCommand = BaseCommand()
  .description('Apply changes to a new or existing datacenter')
  .option('-v, --verbose', 'Turn on verbose logs', { default: false })
  .arguments('<name:string> <config_path:string>')
  .action(update_datacenter_action);

async function update_datacenter_action(options: UpdateDatacenterOptions, name: string, config_path: string) {
  const command_helper = new CommandHelper(options);

  try {
    const currentDatacenterRecord = await command_helper.datacenterStore.get(name);
    const newDatacenter = await parseDatacenter(config_path);
    const allEnvironments = await command_helper.environmentStore.find();
    const datacenterEnvironments = allEnvironments.filter((e) => e.datacenter === name);

    const targetGraph = await newDatacenter.enrichGraph(new CloudGraph());

    for (const record of datacenterEnvironments) {
      const originalEnvGraph = await record.config?.getGraph(record.name, command_helper.componentStore);
      const targetEnvGraph = await newDatacenter.enrichGraph(originalEnvGraph || new CloudGraph(), record.name);

      targetGraph.insertNodes(...targetEnvGraph.nodes);
      targetGraph.insertEdges(...targetEnvGraph.edges);
    }

    targetGraph.validate();

    const originalPipeline = currentDatacenterRecord
      ? await command_helper.getPipelineForDatacenter(currentDatacenterRecord)
      : new Pipeline();

    const newPipeline = Pipeline.plan({
      before: originalPipeline,
      after: targetGraph,
    });

    if (newPipeline.steps.length <= 0) {
      await command_helper.saveDatacenter(name, newDatacenter, newPipeline);
      console.log('Datacenter updated successfully');
    }

    let interval: number;
    if (!options.verbose) {
      interval = setInterval(() => {
        command_helper.renderPipeline(newPipeline, { clear: true });
      }, 1000 / cliSpinners.dots.frames.length);
    }

    let logger: Logger | undefined;
    if (options.verbose) {
      command_helper.renderPipeline(newPipeline);
      logger = winston.createLogger({
        level: 'info',
        format: winston.format.printf(({ message }) => message),
        transports: [new winston.transports.Console()],
      });
    }

    return newPipeline
      .apply({
        providerStore: command_helper.providerStore,
        logger: logger,
        cwd: path.resolve(path.join('./.terraform', name)),
      })
      .then(async () => {
        await command_helper.saveDatacenter(name, newDatacenter, newPipeline);
        command_helper.renderPipeline(newPipeline, { clear: !options.verbose });
        clearInterval(interval);
        console.log('Datacenter updated successfully');
      })
      .catch(async (err) => {
        await command_helper.saveDatacenter(name, newDatacenter, newPipeline);
        clearInterval(interval);
        console.error(err);
        Deno.exit(1);
      });
  } catch (err) {
    if (Array.isArray(err)) {
      err.map((e) => {
        console.log(e);
      });
    } else {
      console.error(err);
      Deno.exit(1);
    }
  }
}

export default UpdateDatacenterCommand;
