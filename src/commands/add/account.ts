import { SupportedProviders } from '../../@providers/index.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from '../../base-command.ts';
import { EnumType } from 'cliffy/command/mod.ts';
import inquirer from 'inquirer';

const providerType = new EnumType(Object.keys(SupportedProviders));

type AddAccountOptions = {
  provider?: string;
} & GlobalOptions;

const AddAccountCommand = BaseCommand()
  .alias('add:accounts')
  .alias('account:add')
  .alias('accounts:add')
  .description('Register an account for use to provision resources')
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
  if (command_helper.providerStore.getProvider(name)) {
    console.error(`An account named ${name} already exists`);
    Deno.exit(1);
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
    { providerName: options.provider },
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
    command_helper.providerStore.saveFile.bind(command_helper.providerStore),
  );
  const validCredentials = await account.testCredentials();
  if (!validCredentials) {
    throw new Error('Invalid credentials');
  }

  try {
    command_helper.providerStore.saveProvider(account);
    console.log(`${account.name} account registered`);
  } catch (ex: any) {
    console.error(ex.message);
    Deno.exit(1);
  }
}

export default AddAccountCommand;
