import { BaseCommand } from '../../base-command.ts';
import { createTable } from '../../utils/table.ts';

export class ListDatacentersCmd extends BaseCommand {
  static description = 'List datacenters registered with the CLI';

  static aliases = ['list:datacenter'];

  async run(): Promise<void> {
    const datacenters = await this.datacenterStore.getDatacenters();

    if (datacenters.length <= 0) {
      this.log('No registered datacenters');
      return;
    }

    const environmentRecords = await this.environmentStore.getEnvironments();
    const items: { name: string; environments: string[] }[] = [];
    for (const dc of datacenters) {
      items.push({
        name: dc.name,
        environments: environmentRecords
          .filter((r) => r.datacenter === dc.name)
          .map((r) => r.name),
      });
    }

    const table = createTable({
      head: ['Name', 'Environments'],
    });

    for (const { name, environments } of items) {
      table.push([name, environments.join(', ')]);
    }

    this.log(table.toString());
  }
}
