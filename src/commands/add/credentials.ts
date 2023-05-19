import { Flags } from '@oclif/core';
import { SupportedProviders } from '../../@providers/supported-providers.js';
import { BaseCommand } from '../../base-command.js';
import CloudCtlConfig from '../../utils/config.js';
import { createProvider } from '../../utils/providers.js';

export default class AddCredentialsCommand extends BaseCommand {
  static description = 'Add credentials for a cloud provider to CloudCtl';
  static displayName = 'add credentials';

  static aliases: string[] = [
    'add credentials',
    'credentials:add',
    'create:providers',
    'register:provider',
    'register:providers',
    'provider:connect',
    'providers:connect',
    'proivder:register',
    'providers:register',
  ];

  static flags = {
    name: Flags.string({
      char: 'n',
      description: 'Name to give to the new provider',
      required: false,
    }),

    type: Flags.enum({
      char: 't',
      description: 'Type of provider to register',
      options: Object.keys(SupportedProviders),
      required: false,
    }),

    dev: Flags.boolean({
      description: 'When enabled no actual terraform is applied',
      default: false,
      hidden: true,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(AddCredentialsCommand);
    CloudCtlConfig.setDev(flags.dev);

    try {
      const provider = await createProvider(flags.name, flags.type);
      this.log(`${provider.name} provider registered`);
    } catch (ex: any) {
      this.error(ex.message);
    }
  }
}
