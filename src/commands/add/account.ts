import { SupportedProviders } from '../../@providers/supported-providers.ts';
import { BaseCommand } from '../../base-command.ts';
import { createProvider } from '../../utils/providers.ts';
import { Flags } from '@oclif/core';

export default class AddAccountCommand extends BaseCommand {
  static description = 'Register an account for use to provision resources';

  static aliases: string[] = ['add:accounts', 'account:add', 'accounts:add'];

  static flags = {
    name: Flags.string({
      char: 'n',
      description: 'Name to give to the new provider',
      required: false,
    }),

    provider: Flags.enum({
      char: 'p',
      description: 'Type of provider to register',
      options: Object.keys(SupportedProviders),
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(AddAccountCommand);

    try {
      const provider = await createProvider(flags.name, flags.type);
      this.log(`${provider.name} account registered`);
    } catch (ex: any) {
      this.error(ex.message);
    }
  }
}
