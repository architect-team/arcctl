import { Input, prompt, Select } from 'cliffy/prompt/mod.ts';
import { SupportedProviders } from '../../@providers/index.ts';
import { Provider } from '../../@providers/provider.ts';
import { ProviderStore } from '../../@providers/store.ts';
import { ResourceType } from '../../@resources/index.ts';
import { Inputs } from './inputs.ts';

export class AccountInputUtils {
  constructor(private providerStore: ProviderStore) {}

  public async createAccount(): Promise<Provider> {
    Inputs.assertInteractiveShell('We are unable to create a new account in a non-interactive shell');
    const allAccounts = await this.providerStore.list();
    const providers = Object.keys(SupportedProviders);

    const res = await prompt([
      {
        name: 'name',
        type: Input,
        message: 'What would you like to name the new account?',
        validate: (input: string) => {
          if (allAccounts.some((a) => a.name === input)) {
            return 'An account with that name already exists.';
          }
          return true;
        },
      },
      {
        type: Select,
        name: 'type',
        message: 'What type of provider are you registering the credentials for?',
        options: providers,
      },
    ]);

    const providerType = res.type as keyof typeof SupportedProviders;
    const credentials = await this.promptForCredentials(providerType);

    const account = new SupportedProviders[providerType](
      res.name!,
      credentials as any,
      this.providerStore,
      {},
    );

    const validCredentials = await account.testCredentials();
    if (!validCredentials) {
      throw new Error('Invalid credentials');
    }

    try {
      await this.providerStore.save(account);
      console.log(`${account.name} account registered`);
    } catch (ex: any) {
      console.error(ex.message);
      Deno.exit(1);
    }

    return account;
  }

  public async promptForCredentials(
    provider_type: keyof typeof SupportedProviders,
    providedCredentials: Record<string, string> = {},
  ): Promise<Record<string, string>> {
    const credential_schema = SupportedProviders[provider_type].CredentialsSchema;

    const credentials: Record<string, string> = {};
    for (const [key, value] of Object.entries(credential_schema.properties)) {
      if (providedCredentials[key]) {
        credentials[key] = providedCredentials[key];
        continue;
      }
      Inputs.assertInteractiveShell(`Cannot prompt for credential ${key} in non-interactive shell`);
      const propValue = value as any;
      const message = [key];
      if (propValue.nullable) {
        message.push('(optional)');
      }
      const cred = await Inputs.promptForSecret({
        message: message.join(' '),
        default: propValue.default || '',
      });

      if (!propValue.nullable && cred === '') {
        console.log('Required credential requires input');
        Deno.exit(1);
      }

      credentials[key] = cred;
    }

    return credentials;
  }

  /**
   * Prompt the user to select a provider they've registered locally. This will also allow them to create a new provider in-line.
   */
  public async promptForAccount(
    options: {
      account?: string;
      prompt_accounts?: Provider[];
      type?: ResourceType;
      action?: 'list' | 'get' | 'create' | 'update' | 'delete';
      message?: string;
    } = {},
  ): Promise<Provider> {
    const allAccounts = await this.providerStore.list();
    let filteredAccounts: Provider[] = [];
    if (!options.prompt_accounts) {
      for (const p of allAccounts) {
        if (options.type && p.resources[options.type]) {
          const service = p.resources[options.type]!;
          if (
            !options.action ||
            options.action in service ||
            (['create', 'update', 'delete'].includes(options.action) && 'construct' in service)
          ) {
            filteredAccounts.push(p);
          }
        } else if (!options.type) {
          filteredAccounts.push(p);
        }
      }
    } else {
      filteredAccounts = options.prompt_accounts;
    }

    let account;
    let selected_account = options.account;
    if (options.account) {
      account = filteredAccounts.find((a) => a.name === options.account);
    } else {
      const newAccountName = 'Add a new account';
      Inputs.assertInteractiveShell('We are unable to prompt for an account in a non-interactive shell');
      selected_account = await Select.prompt({
        message: options.message || 'Select an account',
        options: [
          ...filteredAccounts.map((p) => ({
            name: `${p.name} (${p.type})`,
            value: p.name,
          })),
          {
            name: newAccountName,
            value: newAccountName,
          },
        ],
      });

      if (selected_account === newAccountName) {
        return this.createAccount();
      }

      account = filteredAccounts.find((p) => p.name === selected_account);
    }

    if (!account) {
      console.error(`Account ${selected_account} not found`);
      Deno.exit(1);
    }

    return account;
  }
}
