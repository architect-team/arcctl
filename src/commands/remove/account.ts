import { BaseCommand } from '../../base-command.js';
import { getProviders, saveProviders } from '../../utils/providers.js';

export default class RemoveAccountCmd extends BaseCommand {
  static description = 'Delete the specified account';
  static displayName = 'delete account';

  static aliases: string[] = ['remove:accounts'];

  static args = [
    {
      name: 'name',
      description: 'Name of the account to delete',
    },
  ];

  async run(): Promise<void> {
    const { args } = await this.parse(RemoveAccountCmd);

    const provider = await this.promptForAccount({
      account: args.name,
      message: 'Select the account to delete',
    });

    const providers = await getProviders(this.config.configDir);
    await saveProviders(
      this.config.configDir,
      providers.filter((p) => p.name !== provider.name),
    );
    this.log('Account deleted');
  }
}
