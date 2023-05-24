import { BaseCommand } from '../../base-command.ts';
import { createTable } from '../../utils/table.ts';

export class ListEnvironmentsCmd extends BaseCommand {
  static description = 'List registered environments';

  static aliases = ['list:envs', 'list:env', 'list:environment'];

  static flags = {};

  static args = [];

  async run(): Promise<void> {
    const environments = await this.environmentStore.getEnvironments();
    if (environments.length <= 0) {
      this.log('No environments found');
      return;
    }

    const table = createTable({
      head: ['Name', 'Datacenter'],
    });

    for (const { name, datacenter } of environments) {
      table.push([name, datacenter]);
    }

    this.log(table.toString());
  }
}
