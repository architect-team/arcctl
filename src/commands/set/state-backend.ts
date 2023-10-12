import { buildStateBackend } from '../../state-backend/builder.ts';
import { CredentialSchemas, StateBackendType, StateBackendTypeList } from '../../state-backend/index.ts';
import ArcctlConfig from '../../utils/config.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from '../base-command.ts';
import { Inputs } from '../common/inputs.ts';

type SetStateBackendOptions = {
  type?: string;
  creds?: string[];
} & GlobalOptions;

const SetStateBackendCommand = BaseCommand()
  .description('Configure where to store state files for arcctl')
  .option('--type, -t <type:string>', 'The type of state backend to use')
  .option('--creds <creds:string>', 'A key value pair of credentials to use for the provider', { collect: true })
  .action(set_state_backend);

const promptForBackendCredentials = async (
  backend_type: StateBackendType,
  providedCredentials: Record<string, string>,
): Promise<Record<string, unknown>> => {
  const credentialSchema = CredentialSchemas[backend_type];

  const credentials: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(credentialSchema.properties)) {
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

    const cred = propValue.sensitive
      ? await Inputs.promptForSecret({
        message: message.join(' '),
        default: propValue.default || '',
      })
      : await Inputs.promptString({
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
};

async function set_state_backend(options: SetStateBackendOptions) {
  const command_helper = new CommandHelper(options);

  const backendType = (options.type ?? await Inputs.promptSelection({
    message: 'What type of backend do you want to use?',
    options: StateBackendTypeList,
  })) as StateBackendType;

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

  const credentials = await promptForBackendCredentials(backendType, providedCredentials);
  const backend = buildStateBackend(
    'tmp',
    backendType,
    credentials,
  );

  await backend.testCredentials();

  ArcctlConfig.setStateBackendConfig({
    type: backendType,
    credentials,
  });
  ArcctlConfig.save();
}

export default SetStateBackendCommand;
