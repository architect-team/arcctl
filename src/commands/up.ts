import cliSpinners from 'cli-spinners';
import { existsSync } from 'std/fs/exists.ts';
import * as path from 'std/path/mod.ts';
import { animals, uniqueNamesGenerator } from 'unique-names-generator';
import winston, { Logger } from 'winston';
import { CloudGraph } from '../cloud-graph/index.ts';
import { DatacenterRecord } from '../datacenters/store.ts';
import { Environment, parseEnvironment } from '../environments/index.ts';
import { ImageRepository } from '../oci/index.ts';
import { Pipeline, PlanContextLevel } from '../pipeline/index.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from './base-command.ts';
import { destroyEnvironment } from './destroy/environment.ts';
import { streamLogs } from './logs.ts';

type UpOptions = GlobalOptions & {
  verbose: boolean;
  debug: boolean;
  ingress?: string[];
} & ({ environment: string } | { datacenter: string });

const UpCommand = BaseCommand()
  .description('Spin up an environment that will clean itself up when you terminate the process')
  .arguments('[...components:string]')
  .option('-d, --datacenter <datacenter:string>', 'The datacenter to use for the environment', {
    required: true,
    conflicts: ['environment'],
  })
  .option('-e, --environment <environment:string>', 'The name of your tmp environment', {
    default: 'local',
    conflicts: ['datacenter'],
  })
  .option('-i, --ingress <ingress:string>', 'Mappings of ingress rules for this component to subdomains', {
    collect: true,
  })
  .option('-v, --verbose [verbose:boolean]', 'Turn on verbose logs', { default: false })
  .option('--debug [debug:boolean]', 'Deploy component in debug mode', { default: true })
  .action(up_action);

async function up_action(options: UpOptions, ...components: string[]): Promise<void> {
  const command_helper = new CommandHelper(options);

  let environment: Environment;
  let datacenterRecord: DatacenterRecord;
  let sourcePipeline: Pipeline | undefined;

  if ('environment' in options) {
    const environmentRecord = await command_helper.environmentStore.get(options.environment);
    if (!environmentRecord) {
      throw new Error(`Environment ${options.environment} not found`);
    }

    const dcRecord = await command_helper.datacenterStore.get(environmentRecord.datacenter);
    if (!dcRecord) {
      throw new Error(
        `The ${environmentRecord.name} environment is associated with the ${environmentRecord.datacenter} datacenter, but the datacenter was not found.`,
      );
    }
    datacenterRecord = dcRecord;
    environment = environmentRecord.config || await parseEnvironment({});
    sourcePipeline = environmentRecord.lastPipeline;
  } else {
    const dcRecord = await command_helper.datacenterStore.get(options.datacenter);
    if (!dcRecord) {
      throw new Error(`Datacenter ${options.datacenter} not found`);
    }

    datacenterRecord = dcRecord;
    environment = await parseEnvironment({});
    sourcePipeline = datacenterRecord.lastPipeline;
  }

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

  const envName = 'environment' in options ? options.environment : uniqueNamesGenerator({
    dictionaries: [animals],
    length: 1,
    separator: '-',
    style: 'lowerCase',
    seed: Deno.cwd(),
  });

  let targetGraph = await environment.getGraph(envName, command_helper.componentStore, options.debug);
  targetGraph = await datacenterRecord.config.enrichGraph(targetGraph, {
    environmentName: envName,
    datacenterName: datacenterRecord.name,
  });
  targetGraph.validate();

  const pipeline = await Pipeline.plan({
    before: sourcePipeline,
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
    envName,
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
      await destroyEnvironment({ verbose: options.verbose, autoApprove: true }, envName);
      Deno.exit();
    });

    await streamLogs({ follow: true }, envName);
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
      envName,
      datacenterRecord,
      emptyEnvironment,
      revertedPipeline,
      {
        logger,
      },
    );

    if (revertSuccessful) {
      await command_helper.environmentUtils.removeEnvironment(
        envName,
        datacenterRecord.name,
        datacenterRecord.config,
      );
    } else {
      await command_helper.environmentUtils.saveEnvironment(
        datacenterRecord.name,
        envName,
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
