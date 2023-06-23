import cliSpinners from 'cli-spinners';
import { existsSync } from 'std/fs/exists.ts';
import * as path from 'std/path/mod.ts';
import winston, { Logger } from 'winston';
import { CloudNode } from '../cloud-graph/index.ts';
import { parseEnvironment } from '../environments/index.ts';
import { ImageRepository } from '../oci/index.ts';
import { Pipeline } from '../pipeline/index.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from './base-command.ts';
import { destroyEnvironment } from './destroy/environment.ts';
import { streamLogs } from './logs.ts';

type UpOptions = GlobalOptions & {
  datacenter: string;
  environment: string;
  verbose: boolean;
  debug: boolean;
};

const UpCommand = BaseCommand()
  .description('Spin up an environment that will clean itself up when you terminate the process')
  .arguments('[...components:string]')
  .option('-d, --datacenter <datacenter:string>', 'The datacenter to use for the environment', { required: true })
  .option('-e, --environment <environment:string>', 'The name of your tmp environment', { default: 'local' })
  .option('-v, --verbose [verbose:boolean]', 'Turn on verbose logs', { default: false })
  .option('--debug [debug:boolean]', 'Deploy component in debug mode', { default: true })
  .action(up_action);

async function up_action(options: UpOptions, ...components: string[]): Promise<void> {
  const command_helper = new CommandHelper(options);
  const datacenterRecord = await command_helper.datacenterStore.get(options.datacenter);
  if (!datacenterRecord) {
    console.error('Datacenter not found');
    Deno.exit(1);
  }

  const existingEnv = await command_helper.environmentStore.get(options.environment);
  if (existingEnv) {
    console.error(`Environment already exists with the name ${options.environment}`);
    Deno.exit(1);
  }

  const lastPipeline = await command_helper.getPipelineForDatacenter(datacenterRecord);
  const environment = await parseEnvironment({});

  for (let tag_or_path of components) {
    let componentPath: string | undefined;
    if (existsSync(tag_or_path)) {
      componentPath = path.join(Deno.cwd(), tag_or_path);
      tag_or_path = await command_helper.componentStore.add(tag_or_path);
    }

    const imageRepository = new ImageRepository(tag_or_path);
    await command_helper.componentStore.getComponentConfig(tag_or_path);
    environment.addComponent({
      image: imageRepository,
      path: componentPath,
    });
  }

  let targetGraph = await environment.getGraph(options.environment, command_helper.componentStore, options.debug);

  for (const node of targetGraph.nodes.filter((node) => node.type === 'ingressRule')) {
    const ingressNode = node as CloudNode<'ingressRule'>;
    ingressNode.inputs.subdomain = ingressNode.inputs.subdomain || ingressNode.name;
    targetGraph.insertNodes(ingressNode);
  }

  targetGraph = await datacenterRecord.config.enrichGraph(targetGraph, options.environment);
  targetGraph.validate();

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
    })
    .then(async () => {
      await command_helper.saveDatacenter(datacenterRecord.name, datacenterRecord.config, pipeline);
      await command_helper.environmentStore.save({
        datacenter: datacenterRecord.name,
        name: options.environment,
        config: environment,
      });
      command_helper.renderPipeline(pipeline, { clear: !options.verbose });
      clearInterval(interval);

      Deno.addSignalListener('SIGINT', async () => {
        await destroyEnvironment({ verbose: options.verbose }, options.environment);
        Deno.exit();
      });

      await streamLogs({ follow: true }, options.environment);
    })
    .catch(async (err) => {
      await command_helper.saveDatacenter(datacenterRecord.name, datacenterRecord.config, pipeline);
      command_helper.renderPipeline(pipeline, { clear: !options.verbose });
      clearInterval(interval);
      console.error(err);
      Deno.exit(1);
    });
}

export default UpCommand;
