import { BaseCommand, CommandHelper, GlobalOptions } from './base-command.ts';
import EnvironmentV1 from '../environments/v1/index.ts';
import { Pipeline } from '../pipeline/index.ts';
import * as path from 'std/path/mod.ts';
import { ImageRepository } from '@architect-io/arc-oci';
import cliSpinners from 'cli-spinners';
import winston, { Logger } from 'winston';

type DeployOptions = {
  ingress?: string[];
  verbose?: boolean;
} & GlobalOptions;

const DeployCommand = BaseCommand()
  .description('Deploy a component into an existing environment')
  .arguments('<tag:string> <environment:string>') // 'Component tag to deploy to the environment'
  .option('-i, --ingress <ingress:string>', 'Mappings of ingress rules for this component to subdomains', {
    collect: true,
  })
  .option('-v, --verbose', 'Verbose output')
  .action(deploy_action);

async function deploy_action(options: DeployOptions, tag: string, environment_name: string): Promise<void> {
  const command_helper = new CommandHelper(options);

  try {
    const imageRepository = new ImageRepository(tag);
    await command_helper.componentStore.getComponentConfig(tag);
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
    const previousPipeline = await command_helper.getPipelineForDatacenter(datacenterRecord);

    const environment = environmentRecord.config ||
      new EnvironmentV1({
        components: {},
      });

    const ingressRules: Record<string, string> = {};
    for (const rule of options.ingress || []) {
      const [key, value] = rule.split(':');
      ingressRules[key] = value;
    }

    environment.addComponent({
      image: imageRepository,
      ingresses: ingressRules,
    });

    const targetGraph = await datacenterRecord.config.enrichGraph(
      await environment.getGraph(environmentRecord.name, command_helper.componentStore),
      environmentRecord.name,
    );

    const pipeline = Pipeline.plan({
      before: previousPipeline,
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
        cwd: path.resolve('./.terraform'),
        logger,
      })
      .then(async () => {
        await command_helper.saveDatacenter(datacenterRecord.name, datacenterRecord.config, pipeline);
        await command_helper.environmentStore.save({
          name: environmentRecord.name,
          datacenter: datacenterRecord.name,
          config: environment,
        });
        command_helper.renderPipeline(pipeline, { clear: !options.verbose });
        clearInterval(interval);
      })
      .catch(async (err) => {
        await command_helper.saveDatacenter(datacenterRecord.name, datacenterRecord.config, pipeline);
        command_helper.renderPipeline(pipeline, { clear: !options.verbose });
        clearInterval(interval);
        console.error(err);
        Deno.exit(1);
      });
  } catch (err: any) {
    console.error(err);
    Deno.exit(1);
  }
}
export default DeployCommand;
