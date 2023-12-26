import cliSpinners from 'cli-spinners';
import * as path from 'std/path/mod.ts';
import winston, { Logger } from 'winston';
import { parseEnvironment } from '../environments/index.ts';
import { InfraGraph, PlanContext } from '../graphs/index.ts';
import { ImageRepository } from '../oci/index.ts';
import { pathExistsSync } from '../utils/filesystem.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from './base-command.ts';

type DeployOptions = {
  environment?: string[];
  ingress?: string[];
  variables?: string[];
  verbose: boolean;
  debug: boolean;
  autoApprove: boolean;
  refresh: boolean;
  concurrency: number;
} & GlobalOptions;

const DeployCommand = BaseCommand()
  .name('deploy')
  .description('Deploy a component into an existing environment')
  .arguments('<tag:string>') // 'Component tag to deploy to the environment'
  .option('-e, --environment <environment:string>', 'Environments to deploy the component to', {
    collect: true,
  })
  .option('-i, --ingress <ingress:string>', 'Mappings of ingress rules for this component to subdomains', {
    collect: true,
  })
  .option('-d, --debug [debug:boolean]', 'Use the components debug configuration', { default: false })
  .option('-v, --verbose [verbose:boolean]', 'Turn on verbose logs', { default: false })
  .option('--var, --variable <variables:string>', 'Variables to pass to the component', { collect: true })
  .option('-r, --refresh [refresh:boolean]', 'Force update all resources', { default: false })
  .option('--auto-approve [autoApprove:boolean]', 'Skip all prompts and start the requested action', { default: false })
  .option('-c, --concurrency <concurrency:number>', 'Maximum number of nodes to apply concurrently', { default: 10 })
  .action(deploy_action);

async function deploy_action(options: DeployOptions, tag_or_path: string): Promise<void> {
  const command_helper = new CommandHelper(options);

  try {
    let componentPath: string | undefined;
    if (pathExistsSync(tag_or_path)) {
      componentPath = path.join(Deno.cwd(), tag_or_path);
      tag_or_path = await command_helper.componentStore.add(tag_or_path);
    }

    const imageRepository = new ImageRepository(tag_or_path);
    await command_helper.componentStore.getComponentConfig(tag_or_path);

    if (!options.environment || options.environment.length <= 0) {
      console.error('Must specify at least one environment to deploy to');
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

      const ingressRules: Record<string, string> = {};
      for (const rule of options.ingress || []) {
        const [key, value] = rule.split(':');
        ingressRules[key] = value;
      }

      const variables: Record<string, string> = {};
      for (const v of options.variables || []) {
        const [key, value] = v.split(':');
        variables[key] = value;
      }

      environment.addComponent({
        image: imageRepository,
        ingresses: ingressRules,
        path: componentPath,
        debug: options.debug,
        variables,
      });

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
            message: `Deploying ${tag_or_path} to ${environmentRecord.name}`,
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
            message: `Deploying ${tag_or_path} to ${environmentRecord.name}`,
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
            message: `Deploying ${tag_or_path} to ${environmentRecord.name}`,
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
export default DeployCommand;
