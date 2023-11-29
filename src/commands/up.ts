import cliSpinners from 'cli-spinners';
import * as path from 'std/path/mod.ts';
import { adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator';
import winston, { Logger } from 'winston';
import { DatacenterRecord } from '../datacenters/index.ts';
import { parseEnvironment } from '../environments/index.ts';
import { InfraGraph, PlanContext } from '../graphs/index.ts';
import { ImageRepository } from '../oci/index.ts';
import ArcctlConfig from '../utils/config.ts';
import { pathExistsSync } from '../utils/filesystem.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from './base-command.ts';

type UpOptions = {
  datacenter?: string;
  environment?: string;
  verbose: boolean;
  debug: boolean;
} & GlobalOptions;

export const UpCommand = BaseCommand()
  .name('up')
  .description('Create a new ephemeral environment that cleans itself up')
  .arguments('<components...>')
  .option(
    '-d, --datacenter <datacenter:string>',
    'Datacenter to create the environment in. Defaults to the set defaults.datacenter if set.',
  )
  .option('-e, --environment <environment:string>', 'Name to give to the generated environment')
  .option('--debug [debug:boolean]', 'Use the components debug configuration', { default: false })
  .option('-v, --verbose [verbose:boolean]', 'Turn on verbose logs', { default: false })
  .action(async (options: UpOptions, ...components: string[]) => {
    const command_helper = new CommandHelper(options);

    let datacenterRecord: DatacenterRecord | undefined;
    if (!options.datacenter) {
      datacenterRecord = await ArcctlConfig.getDefaultDatacenter(command_helper);
      if (!datacenterRecord) {
        console.error(
          'No default datacenter is set, use the --datacenter flag or set a datacenter with `arcctil set defaults.datacenter`.',
        );
        Deno.exit(1);
      }
    } else {
      datacenterRecord = await command_helper.datacenterStore.get(options.datacenter);
      if (!datacenterRecord) {
        console.error(`Invalid datacenter associated with environment: ${options.datacenter}`);
        Deno.exit(1);
      }
    }
    const datacenter = datacenterRecord;

    const environment = await parseEnvironment({});

    for (let tag_or_path of components) {
      try {
        let componentPath: string | undefined;
        if (pathExistsSync(tag_or_path)) {
          componentPath = path.join(Deno.cwd(), tag_or_path);
          tag_or_path = await command_helper.componentStore.add(tag_or_path);
        }

        const imageRepository = new ImageRepository(tag_or_path);
        await command_helper.componentStore.getComponentConfig(tag_or_path);

        environment.addComponent({
          image: imageRepository,
          path: componentPath,
        });
      } catch (err) {
        console.error(err);
        Deno.exit(1);
      }
    }

    const environmentName = options.environment ?? uniqueNamesGenerator({
      dictionaries: [adjectives, animals],
      length: 2,
      separator: '-',
      style: 'lowerCase',
    });

    const targetGraph = datacenter.config.getGraph(
      await environment.getGraph(environmentName, command_helper.componentStore, options.debug),
      {
        environmentName: environmentName,
        datacenterName: datacenter.name,
      },
    );

    const pipeline = await InfraGraph.plan({
      before: new InfraGraph(),
      after: targetGraph,
      context: PlanContext.Component,
    });
    pipeline.validate();
    await command_helper.infraRenderer.confirmGraph(pipeline);

    let interval: number;
    if (!options.verbose) {
      interval = setInterval(() => {
        command_helper.infraRenderer.renderGraph(pipeline, {
          clear: true,
          message: `Creating ephemeral environment named ${environmentName}`,
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

    pipeline
      .apply({ logger })
      .toPromise()
      .then(async () => {
        await command_helper.environmentUtils.saveEnvironment(
          datacenter.name,
          environmentName,
          environment,
          pipeline,
        );
        command_helper.infraRenderer.renderGraph(pipeline, {
          clear: !options.verbose,
          disableSpinner: true,
          message: `${environmentName} is ready`,
        });
        clearInterval(interval);

        console.log('Waiting for sigint to clean up environment...');

        Deno.addSignalListener('SIGINT', async () => {
          const revertPipeline = await InfraGraph.plan({
            before: pipeline,
            after: new InfraGraph(),
            context: PlanContext.Component,
          });
          revertPipeline.validate();

          if (!options.verbose) {
            interval = setInterval(() => {
              command_helper.infraRenderer.renderGraph(revertPipeline, {
                clear: true,
                message: `Cleaning up environment`,
              });
            }, 1000 / cliSpinners.dots.frames.length);
          }

          await revertPipeline.apply({ logger })
            .toPromise()
            .then(async () => {
              await command_helper.environmentUtils.removeEnvironment(
                environmentName,
                datacenter.name,
                datacenter.config,
              );
              command_helper.infraRenderer.renderGraph(revertPipeline, {
                clear: !options.verbose,
                disableSpinner: true,
                message: `${environmentName} removed`,
              });
              clearInterval(interval);
              Deno.exit(0);
            })
            .catch(async (err) => {
              await command_helper.environmentUtils.saveEnvironment(
                datacenter.name,
                environmentName,
                environment,
                revertPipeline,
              );
              command_helper.infraRenderer.renderGraph(revertPipeline, {
                clear: !options.verbose,
                disableSpinner: true,
                message: `Failed to clean up environment`,
              });
              clearInterval(interval);
              console.error(err);
              Deno.exit(1);
            });
        });
      })
      .catch(async (err) => {
        await command_helper.environmentUtils.saveEnvironment(
          datacenter.name,
          environmentName,
          environment,
          pipeline,
        );
        command_helper.infraRenderer.renderGraph(pipeline, {
          clear: !options.verbose,
          disableSpinner: true,
          message: `Failed to create environment`,
        });
        clearInterval(interval);
        console.error(err);
        Deno.exit(1);
      });

    // Busy loop waiting for a sigint to clean up environment
    while (true) {
      await new Promise((f) => setTimeout(f, 500));
    }
  });
