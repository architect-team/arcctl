import { Select } from 'cliffy/prompt/mod.ts';
import { SupportedProviders } from '../../@providers/index.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from '../base-command.ts';

type SetSecretAccountOptions = {
  provider?: string;
  creds?: string[];
} & GlobalOptions;

const SetSecretAccountCommand = BaseCommand()
  .description('Configure where to store the configuration settings for arcctl')
  .option('--provider <provider:string>', 'Which provider type to use')
  .option('--creds <creds:string>', 'A key value pair of credentials to use for the provider', { collect: true })
  .action(set_secret_account);

async function set_secret_account(options: SetSecretAccountOptions) {
  const command_helper = new CommandHelper(options);

  const providerName = options.provider ||
    (await Select.prompt({
      message: 'What provider will this account connect to?',
      options: Object.keys(SupportedProviders),
    }));

  const providerType = providerName as keyof typeof SupportedProviders;

  const providedCredentials: Record<string, string> = {};
  for (const cred of options.creds || []) {
    const [key, value] = cred.split('=');
    providedCredentials[key] = value;
  }

  const credentials = await command_helper.promptForCredentials(providerType, providedCredentials);

  const account = new SupportedProviders[providerType](
    'secret',
    credentials as any,
    command_helper.providerStore,
  );
  const validCredentials = await account.testCredentials();
  if (!validCredentials) {
    throw new Error('Invalid credentials');
  }

  await command_helper.secretStore.save({
    provider: providerType,
    credentials,
  });
  console.log(command_helper.secretStore);
}

export default SetSecretAccountCommand;
