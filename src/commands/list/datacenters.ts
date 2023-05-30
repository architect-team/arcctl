import { BaseCommand } from '../../base-command.ts';
import { Pipeline } from '../../pipeline/index.ts';
import { createTable } from '../../utils/table.ts';

export class ListDatacentersCmd extends BaseCommand {
  static description = 'List datacenters registered with the CLI';

  static aliases = ['list:datacenter'];

  async run(): Promise<void> {
    const datacenters = await this.datacenterStore.find();

    if (datacenters.length <= 0) {
      this.log('No registered datacenters');
      return;
    }

    const environmentRecords = await this.environmentStore.find();

    const table = createTable({
      head: ['Name', 'Environments', 'Resources'],
    });

    for (const dc of datacenters) {
      const pipeline = await this.getPipelineForDatacenter(dc);
      table.push([
        dc.name,
        environmentRecords
          .filter((r) => r.datacenter === dc.name)
          .map((r) => r.name)
          .join(', '),
        String(pipeline.steps.filter((s) => s.action !== 'delete').length),
      ]);
    }

    this.log(table.toString());
  }
}
