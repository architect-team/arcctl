import { Input } from 'cliffy/prompt/mod.ts';
import { SupportedProviders } from '../../@providers/index.ts';
import CloudCtlConfig from '../../utils/config.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from '../base-command.ts';
import { Inputs } from '../common/inputs.ts';

type SetStateBackendOptions = {
  provider?: string;
  namespace?: string;
  creds?: string[];
} & GlobalOptions;

const SetStateBackendCommand = BaseCommand()
  .description('Configure where to store the configuration settings for arcctl')
  .option('--provider <provider:string>', 'Which provider type to use')
  .option('--namespace <namespace:string>', 'The namespace to use for the prvoider')
  .option('--creds <creds:string>', 'A key value pair of credentials to use for the provider', { collect: true })
  .action(set_state_backend);

async function set_state_backend(options: SetStateBackendOptions) {
  const command_helper = new CommandHelper(options);

  const providerName = options.provider ||
    (await Inputs.promptSelection({
      message: 'What provider will this account connect to?',
      options: Object.keys(SupportedProviders),
    }));

  const providerType = providerName as keyof typeof SupportedProviders;

  let providedCredentials: Record<string, string> = {};
  for (const cred of options.creds || []) {
    if (cred.indexOf('=') === -1) {
      try {
        const creds = JSON.parse(cred);
        providedCredentials = {
          ...providedCredentials,
          ...creds,
        };
        continue;
      } catch {
        throw new Error('Invalid credentials');
      }
    }
    const [key, value] = cred.split('=');
    providedCredentials[key] = value;
  }

  const credentials = await command_helper.accountInputUtils.promptForCredentials(providerType, providedCredentials);

  const namespace = options.namespace || await Input.prompt({
    message: 'What namespace should this account use?',
  });

  const account = new SupportedProviders[providerType](
    'secret',
    credentials as any,
    command_helper.providerStore,
    {},
  );
  const validCredentials = await account.testCredentials();
  if (!validCredentials) {
    throw new Error('Invalid credentials');
  }

  CloudCtlConfig.setStateBackend({
    provider: providerType,
    credentials,
    namespace,
  });
  CloudCtlConfig.save();
}

export default SetStateBackendCommand;
