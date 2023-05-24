import { BaseCommand } from '../../base-command.ts';
import { CloudGraph } from '../../cloud-graph/index.ts';
import { ExecutableGraph } from '../../executable-graph/index.ts';
import { EnvironmentRecord } from '../../utils/environment-store.ts';
import cliSpinners from 'cli-spinners';
import inquirer from 'inquirer';
import path from 'path';

export class DestroyEnvironmentCmd extends BaseCommand {
  static description = 'Destroy all the resources in the specified environment';

  static args = [
    {
      name: 'name',
      description: 'Name of the environment to destroy',
    },
  ];

  private async promptForEnvironment(
    name?: string,
  ): Promise<EnvironmentRecord> {
    const environmentRecords = await this.environmentStore.getEnvironments();

    if (environmentRecords.length <= 0) {
      this.error('There are no environments to destroy');
    }

    const selected = environmentRecords.find((r) => r.name === name);
    const { environment } = await inquirer.prompt(
      [
        {
          name: 'environment',
          type: 'list',
          message: 'Select an environment to destroy',
          choices: environmentRecords.map((r) => ({
            name: r.name,
            value: r,
          })),
        },
      ],
      { environment: selected },
    );

    return environment;
  }

  async run(): Promise<void> {
    const { args } = await this.parse(DestroyEnvironmentCmd);

    const {
      name,
      graph: previousGraph,
      datacenter: datacenterName,
    } = await this.promptForEnvironment(args.name);

    const graphPlan = ExecutableGraph.plan({
      before: previousGraph,
      after: new CloudGraph(),
      datacenter: datacenterName,
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
        await this.environmentStore.removeEnvironment(name);
        if (graphPlan.nodes.length > 0) {
          this.renderGraph(graphPlan);
        }
        clearInterval(interval);
        this.log('Environment destroyed successfully');
      })
      .catch((err) => {
        clearInterval(interval);
        this.error(err);
      });
  }
}
