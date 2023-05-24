import { SupportedProviders } from '../../@providers/index.js';
import { BaseCommand } from '../../base-command.js';
import { Flags } from '@oclif/core';
import inquirer from 'inquirer';

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

    const name = await this.promptForStringInputs(
      {
        name: 'name',
        schema: {
          type: 'string',
          description: 'Name your new account',
        },
      },
      undefined,
      { name: args.name },
    );
    if (this.providerStore.getProvider(name)) {
      this.error(`An account named ${name} already exists`);
    }

    const { providerName } = await inquirer.prompt(
      [
        {
          type: 'list',
          name: 'providerName',
          message: 'What provider will this account connect to?',
          choices: Object.keys(SupportedProviders),
        },
      ],
      { providerName: flags.provider },
    );

    const providerType = providerName as keyof typeof SupportedProviders;
    const credentialSchema = SupportedProviders[providerType].CredentialsSchema;
    const credentials = await inquirer.prompt(
      Object.entries(credentialSchema.properties).map(([key, value]) => ({
        name: key,
        type: 'password',
        message: key,
        required: !(value as any).default,
        default: (value as any).default,
      })),
    );

    const account = new SupportedProviders[providerType](
      name,
      credentials,
      this.providerStore.saveFile.bind(this.providerStore),
    );
    const validCredentials = await account.testCredentials();
    if (!validCredentials) {
      throw new Error('Invalid credentials');
    }

    try {
      this.providerStore.saveProvider(account);
      this.log(`${account.name} account registered`);
    } catch (ex: any) {
      this.error(ex.message);
    }
  }
}
