import { SupportedProviders } from '../../@providers/supported-providers.js';
import { BaseCommand } from '../../base-command.js';
import { createProvider } from '../../utils/providers.js';
import { Flags } from '@oclif/core';

export default class AddAccountCommand extends BaseCommand {
  static description = 'Register an account for use to provision resources';

  static aliases: string[] = ['add:accounts', 'account:add', 'accounts:add'];

  static args = [
    {
      name: 'name',
      description: 'Name to give to the account',
    },
  ];

  static flags = {
    provider: Flags.enum({
      char: 'p',
      description: 'Type of provider to register',
      options: Object.keys(SupportedProviders),
    }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(AddAccountCommand);

    try {
      const provider = await createProvider(args.name, flags.type);
      this.log(`${provider.name} account registered`);
    } catch (ex: any) {
      this.error(ex.message);
    }
  }
}
