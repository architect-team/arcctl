import { Flags } from '@oclif/core';
import { ResourceType } from '../../@resources/index.js';
import { BaseCommand } from '../../base-command.js';
import { createTable } from '../../utils/table.js';

export default class ListAllResourcesCommand extends BaseCommand {
  static description = 'List all the cloud resources for each supported type';
  static displayName = 'list all';

  static flags = {
    credentials: Flags.string({
      char: 'c',
      description:
        'The cloud provider credentials to use to apply this resource',
    }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(ListAllResourcesCommand);
    const provider = await this.promptForProvider({
      provider: flags.credentials,
      type: args.type,
      action: 'list',
    });

    const displayableTypes: Set<ResourceType> = new Set([
      'kubernetesCluster',
      'vpc',
    ]);

    for (const [resourceType, resourceImpl] of provider.getResourceEntries()) {
      if (!displayableTypes.has(resourceType) || !resourceImpl.list) {
        continue;
      }

      const results = await resourceImpl.list();
      if (results.rows.length === 0) {
        continue;
      }

      this.log(`Resource: ${resourceType}`);
      const table = createTable({
        head: Object.keys(results.rows[0]),
      });
      table.push(...results.rows.map((r) => Object.values(r).map(String)));
      this.log(table.toString());
      this.log();
    }
  }
}
