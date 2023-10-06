import { CloudGraph } from '../app-graph/index.ts';
import { Datacenter, parseDatacenter } from '../datacenters/index.ts';
import { Environment, parseEnvironment } from '../environments/index.ts';
import { ImageRepository } from '../oci/index.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from './base-command.ts';

type GraphOptions = {
  environment?: string;
  datacenter?: string;
  component?: string;
} & GlobalOptions;

const GraphCommand = BaseCommand()
  .name('graph')
  .description('Generate a graph of an environment or datacenter')
  .option('-e, --environment <environment:string>', 'Environment to generate graph of')
  .option('-d, --datacenter <datacenter:string>', 'Datacenter to generate graph of')
  .option('-c, --component <component:string>', 'Component to generate graph of')
  .action(graph_action);

async function graph_action(options: GraphOptions): Promise<void> {
  const command_helper = new CommandHelper(options);
  const environment_name = 'test_environment';

  if (!options.datacenter && !options.environment && !options.component) {
    throw new Error('Must specify at least one of: --datacenter, --environment, --component');
  }

  if (!options.component && options.environment) {
    throw new Error('Must specify --component when specifying --environment');
  }

  let environment: Environment | undefined;
  let datacenter: Datacenter | undefined;
  if (options.environment) {
    environment = await parseEnvironment(options.environment);
  }
  if (options.datacenter) {
    datacenter = await parseDatacenter(options.datacenter);
  }

  let graph = new CloudGraph();
  if (environment) {
    if (options.component) {
      const imageRepository = new ImageRepository(options.component);
      await command_helper.componentStore.getComponentConfig(options.component);
      environment.addComponent({
        image: imageRepository,
      });
    }
    graph = await environment.getGraph(environment_name, command_helper.componentStore);
  }

  if (options.datacenter && datacenter) {
    graph = await datacenter.enrichGraph(graph, {
      environmentName: environment ? environment_name : undefined,
      datacenterName: options.datacenter,
    });
  }

  const umlLines = [`@startuml`];
  for (const node of graph.nodes) {
    umlLines.push(`class "${node.id}" {`);
    // for (const [key, value] of Object.entries(node.inputs)) {
    //   let displayValue = value;
    //   if (typeof value === 'object' || Array.isArray(value)) {
    //     displayValue = JSON.stringify(value);
    //   }
    //   displayValue = displayValue?.toString().includes('\n') ? `CANNOT DISPLAY` : displayValue;
    //   umlLines.push(`  ${key}: ${displayValue}`);
    // }
    umlLines.push(`  {method} account ${node.account}`);
    if (node.environment) {
      umlLines.push(`  {method} environment ${node.environment}`);
    }
    umlLines.push(`}`);
  }
  for (const edge of graph.edges) {
    const from = edge.from;
    const to = edge.to;
    umlLines.push(`"${to}" --> "${from}"`);
  }
  umlLines.push('@enduml');
  console.log(umlLines.join('\n'));
}
export default GraphCommand;
