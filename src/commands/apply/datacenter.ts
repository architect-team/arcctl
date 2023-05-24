import { BaseCommand } from '../../base-command.js';
import { CloudGraph } from '../../cloud-graph/index.js';
import { parseDatacenter } from '../../datacenters/index.js';
import { Pipeline } from '../../pipeline/index.js';
import { Flags } from '@oclif/core';

export default class ApplyDatacenterChangesCmd extends BaseCommand {
  static description = 'Apply changes to a new or existing datacenter';

  static flags = {
    name: Flags.string({
      char: 'n',
      description: `Name of the datacenter to modify. If it doesn't exist, one will be created.`,
      required: true,
    }),
  };

  static args = [
    {
      name: 'config_path',
      description: 'Path to the new datacenter configuration file',
      required: true,
    },
  ];

  async run(): Promise<void> {
    const { args, flags } = await this.parse(ApplyDatacenterChangesCmd);

    try {
      const newDatacenter = await parseDatacenter(args.config_path);
      const allEnvironments = await this.environmentStore.getEnvironments();
      const datacenterEnvironments = allEnvironments.filter(
        (e) => e.datacenter === flags.name,
      );

      const graph = new Pipeline();

      for (const record of datacenterEnvironments) {
        const originalEnvGraph = await record.config?.getGraph(
          record.name,
          this.componentStore,
        );
        const targetEnvGraph = await newDatacenter.enrichGraph(
          originalEnvGraph || new CloudGraph(),
          record.name,
        );

        const environmentPlan = Pipeline.plan({
          before: record.graph,
          after: targetEnvGraph,
          datacenter: flags.name,
        });

        graph.insertNodes(...environmentPlan.nodes);
        graph.insertEdges(...environmentPlan.edges);
      }

      graph.validate();

      if (graph.nodes.length > 0) {
        this.renderPipeline(graph);
      }

      await this.datacenterStore.saveDatacenter({
        name: flags.name,
        config: newDatacenter,
      });

      this.log('Datacenter saved successfully');
    } catch (err: any) {
      if (Array.isArray(err)) {
        err.map((e) => {
          this.log(e);
        });
      } else {
        this.error(err);
      }
    }
  }
}
