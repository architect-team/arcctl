import { BaseCommand } from '../../base-command.js';
import { getProviders, saveProviders } from '../../utils/providers.js';

export default class DeleteProviderCommand extends BaseCommand {
  static description = 'Delete the specified provider and its credentials';
  static displayName = 'delete providers';

  static aliases: string[] = [
    'delete providers',
    'delete:providers',
    'deregister:provider',
    'deregister:providers',
  ];

  static args = [
    {
      name: 'name',
      description: 'Name of the provider to delete',
    },
  ];

  async run(): Promise<void> {
    const { args } = await this.parse(DeleteProviderCommand);

    const provider = await this.promptForProvider({
      provider: args.name,
    });

    const providers = await getProviders(this.config.configDir);
    await saveProviders(
      this.config.configDir,
      providers.filter((p) => p.name !== provider.name),
    );
    this.log('Provider deleted');
  }
}
