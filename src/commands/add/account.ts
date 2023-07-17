import { EnumType } from 'cliffy/command/mod.ts';
import { Select } from 'cliffy/prompt/mod.ts';
import { SupportedProviders } from '../../@providers/index.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from '../base-command.ts';

const providerType = new EnumType(Object.keys(SupportedProviders));

type AddAccountOptions = {
  provider?: string;
} & GlobalOptions;

const AddAccountCommand = BaseCommand()
  .description('Register an account to use to provision resources')
  .type('providerType', providerType)
  .option('-p, --provider <provider:providerType>', 'Type of provider to register')
  .arguments('[account_name:string]')
  .action(add_account_action);

async function add_account_action(options: AddAccountOptions, account_name?: string) {
  const command_helper = new CommandHelper(options);

  const name = await command_helper.promptForStringInputs(
    {
      name: 'name',
      schema: {
        type: 'string',
        description: 'Name your new account',
      },
    },
    undefined,
    { name: account_name },
  );
  if (command_helper.providerStore.get(name)) {
    console.error(`An account named ${name} already exists`);
    Deno.exit(1);
  }

  const providerName = options.provider ||
    (await Select.prompt({
      message: 'What provider will this account connect to?',
      options: Object.keys(SupportedProviders),
    }));

  const providerType = providerName as keyof typeof SupportedProviders;

  const credentials = await command_helper.promptForCredentials(providerType);
  const account = new SupportedProviders[providerType](
    name,
    credentials as any,
    command_helper.providerStore,
  );
  const validCredentials = await account.testCredentials();
  if (!validCredentials) {
    throw new Error('Invalid credentials');
  }

  try {
    command_helper.providerStore.save(account);
    console.log(`${account.name} account registered`);
  } catch (ex: any) {
    console.error(ex.message);
    Deno.exit(1);
  }
}

export default AddAccountCommand;
