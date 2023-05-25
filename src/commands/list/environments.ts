import { BaseCommand } from '../../base-command.js';
import { createTable } from '../../utils/table.js';

export class ListEnvironmentsCmd extends BaseCommand {
  static description = 'List registered environments';

  static aliases = ['list:envs', 'list:env', 'list:environment'];

  async run(): Promise<void> {
    const environments = await this.environmentStore.find();
    if (environments.length <= 0) {
      this.log('No environments found');
      return;
    }

    const table = createTable({
      head: ['Name', 'Datacenter', 'Resources'],
    });

    for (const { name, datacenter } of environments) {
      const datacenterRecord = await this.datacenterStore.get(datacenter);

      let resourceCount = 0;
      if (datacenterRecord) {
        const pipeline = await this.getPipelineForDatacenter(datacenterRecord);
        resourceCount = pipeline.steps.filter(
          (step) => step.action !== 'delete' && step.environment === name,
        ).length;
      }

      table.push([name, datacenter, String(resourceCount)]);
    }

    this.log(table.toString());
  }
}
