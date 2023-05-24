import { BaseCommand } from '../../base-command.js';
import { Pipeline } from '../../pipeline/index.js';
import { createTable } from '../../utils/table.js';

export class ListDatacentersCmd extends BaseCommand {
  static description = 'List datacenters registered with the CLI';

  static aliases = ['list:datacenter'];

  async run(): Promise<void> {
    const datacenters = await this.datacenterStore.find();

    if (datacenters.length <= 0) {
      this.log('No registered datacenters');
      return;
    }

    const environmentRecords = await this.environmentStore.getEnvironments();
    const items: {
      name: string;
      environments: string[];
      pipeline: Pipeline;
    }[] = [];
    for (const dc of datacenters) {
      const pipeline = await this.getPipelineForDatacenter(dc);

      items.push({
        name: dc.name,
        environments: environmentRecords
          .filter((r) => r.datacenter === dc.name)
          .map((r) => r.name),
        pipeline,
      });
    }

    const table = createTable({
      head: ['Name', 'Environments', 'Resources'],
    });

    for (const { name, environments, pipeline } of items) {
      table.push([
        name,
        environments.join(', '),
        String(pipeline.steps.filter((s) => s.action !== 'delete').length),
      ]);
    }

    this.log(table.toString());
  }
}
