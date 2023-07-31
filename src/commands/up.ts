import cliSpinners from 'cli-spinners';
import { existsSync } from 'std/fs/exists.ts';
import * as path from 'std/path/mod.ts';
import winston, { Logger } from 'winston';
import { CloudGraph } from '../cloud-graph/index.ts';
import { parseEnvironment } from '../environments/index.ts';
import { ImageRepository } from '../oci/index.ts';
import { Pipeline, PlanContextLevel } from '../pipeline/index.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from './base-command.ts';
import { destroyEnvironment } from './destroy/environment.ts';
import { streamLogs } from './logs.ts';

type UpOptions = GlobalOptions & {
  datacenter: string;
  environment: string;
  verbose: boolean;
  debug: boolean;
  ingress?: string[];
};

const UpCommand = BaseCommand()
  .description('Spin up an environment that will clean itself up when you terminate the process')
  .arguments('[...components:string]')
  .option('-d, --datacenter <datacenter:string>', 'The datacenter to use for the environment', { required: true })
  .option('-e, --environment <environment:string>', 'The name of your tmp environment', { default: 'local' })
  .option('-i, --ingress <ingress:string>', 'Mappings of ingress rules for this component to subdomains', {
    collect: true,
  })
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

  const lastPipeline = datacenterRecord.lastPipeline;
  const environment = await parseEnvironment({});

  for (let tag_or_path of components) {
    let componentPath: string | undefined;
    if (existsSync(tag_or_path)) {
      componentPath = path.join(Deno.cwd(), tag_or_path);
      tag_or_path = await command_helper.componentStore.add(tag_or_path);
    }

    const imageRepository = new ImageRepository(tag_or_path);
    await command_helper.componentStore.getComponentConfig(tag_or_path);

    const ingressRules: Record<string, string> = {};
    for (const rule of options.ingress || []) {
      const [key, value] = rule.split(':');
      ingressRules[key] = value;
    }

    environment.addComponent({
      image: imageRepository,
      path: componentPath,
      ingresses: ingressRules,
    });
  }

  let targetGraph = await environment.getGraph(options.environment, command_helper.componentStore, options.debug);
  targetGraph = await datacenterRecord.config.enrichGraph(targetGraph, {
    environmentName: options.environment,
    datacenterName: datacenterRecord.name,
  });
  targetGraph.validate();

  const pipeline = await Pipeline.plan({
    before: lastPipeline,
    after: targetGraph,
    contextFilter: PlanContextLevel.Environment,
  }, command_helper.providerStore);
  pipeline.validate();

  let interval: number | undefined;
  if (!options.verbose) {
    interval = setInterval(() => {
      command_helper.pipelineRenderer.renderPipeline(pipeline, { clear: true });
    }, 1000 / cliSpinners.dots.frames.length);
  }

  let logger: Logger | undefined;
  if (options.verbose) {
    command_helper.pipelineRenderer.renderPipeline(pipeline);
    logger = winston.createLogger({
      level: 'info',
      format: winston.format.printf(({ message }) => message),
      transports: [new winston.transports.Console()],
    });
  }

  const success = await command_helper.environmentUtils.applyEnvironment(
    options.environment,
    datacenterRecord,
    environment,
    pipeline,
    {
      logger,
    },
  );

  if (interval) {
    clearInterval(interval);
  }

  command_helper.pipelineRenderer.renderPipeline(pipeline, { clear: !options.verbose, disableSpinner: true });
  command_helper.pipelineRenderer.doneRenderingPipeline();

  if (success) {
    Deno.addSignalListener('SIGINT', async () => {
      await destroyEnvironment({ verbose: options.verbose, autoApprove: true }, options.environment);
      Deno.exit();
    });

    await streamLogs({ follow: true }, options.environment);
  } else {
    const emptyEnvironment = await parseEnvironment({});
    const targetGraph = await datacenterRecord.config.enrichGraph(
      new CloudGraph(),
      {
        datacenterName: datacenterRecord.name,
      },
    );
    const revertedPipeline = await Pipeline.plan({
      before: pipeline,
      after: targetGraph,
      contextFilter: PlanContextLevel.Environment,
    }, command_helper.providerStore);

    revertedPipeline.validate();

    if (!options.verbose) {
      interval = setInterval(() => {
        command_helper.pipelineRenderer.renderPipeline(revertedPipeline, { clear: true });
      }, 1000 / cliSpinners.dots.frames.length);
    }

    const revertSuccessful = await command_helper.environmentUtils.applyEnvironment(
      options.environment,
      datacenterRecord,
      emptyEnvironment,
      revertedPipeline,
      {
        logger,
      },
    );

    if (revertSuccessful) {
      await command_helper.environmentUtils.removeEnvironment(
        options.environment,
        datacenterRecord.name,
        datacenterRecord.config,
      );
    } else {
      await command_helper.environmentUtils.saveEnvironment(
        datacenterRecord.name,
        options.environment,
        emptyEnvironment,
        revertedPipeline,
      );
    }

    if (interval) {
      clearInterval(interval);
    }

    command_helper.pipelineRenderer.renderPipeline(revertedPipeline, { clear: !options.verbose, disableSpinner: true });
    command_helper.pipelineRenderer.doneRenderingPipeline();
  }
}

export default UpCommand;
