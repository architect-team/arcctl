import { BaseCommand } from '../../base-command.ts';
import { CloudGraph } from '../../cloud-graph/index.ts';
import { ExecutableGraph } from '../../executable-graph/index.ts';
import { DatacenterRecord } from '../../utils/datacenter-store.ts';
import cliSpinners from 'cli-spinners';
import inquirer from 'inquirer';
import path from 'path';

export class DestroyDatacenterCmd extends BaseCommand {
  static description =
    'Destroy a datacenter and all the environments managed by it';

  static args = [
    {
      name: 'name',
      description: 'Name of the datacenter to destroy',
    },
  ];

  private async promptForDatacenter(name?: string): Promise<DatacenterRecord> {
    const datacenterRecords = await this.datacenterStore.getDatacenters();

    if (datacenterRecords.length <= 0) {
      this.error('There are no datacenters to destroy');
    }

    const selected = datacenterRecords.find((d) => d.name === name);
    const { datacenter } = await inquirer.prompt(
      [
        {
          name: 'datacenter',
          type: 'list',
          message: 'Select a datacenter to destroy',
          choices: datacenterRecords.map((r) => ({
            name: r.name,
            value: r,
          })),
        },
      ],
      { datacenter: selected },
    );

    return datacenter;
  }

  async run(): Promise<void> {
    const { args } = await this.parse(DestroyDatacenterCmd);

    const { name, config: datacenter } = await this.promptForDatacenter(
      args.name,
    );

    const allEnvironments = await this.environmentStore.getEnvironments();
    const datacenterEnvironments = allEnvironments.filter(
      (r) => r.datacenter === name,
    );

    const graph = new ExecutableGraph();
    for (const record of datacenterEnvironments) {
      const environmentGraph = await datacenter.enrichGraph(
        record.graph,
        record.name,
      );
      environmentGraph.validate();

      graph.insertNodes(...environmentGraph.nodes);
      graph.insertEdges(...environmentGraph.edges);
    }

    graph.validate();

    const graphPlan = ExecutableGraph.plan({
      before: graph,
      after: new CloudGraph(),
      datacenter: name,
    });

    const interval = setInterval(() => {
      if (graphPlan.nodes.length > 0) {
        this.renderGraph(graphPlan);
      }
    }, 1000 / cliSpinners.dots.frames.length);

    return graphPlan
      .apply({
        datacenterStore: this.datacenterStore,
        providerStore: this.providerStore,
        cwd: path.resolve('./.terraform'),
      })
      .then(async () => {
        for (const environmentRecord of datacenterEnvironments) {
          await this.environmentStore.removeEnvironment(environmentRecord.name);
        }

        await this.datacenterStore.removeDatacenter(name);
        if (graphPlan.nodes.length > 0) {
          this.renderGraph(graphPlan);
        } else {
          this.log('No environments found.');
        }
        clearInterval(interval);
        this.log('Datacenter destroyed successfully');
      })
      .catch((err) => {
        clearInterval(interval);
        this.error(err);
      });
  }
}
