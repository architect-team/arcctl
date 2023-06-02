import { Provider } from '../@providers/index.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from './base-command.ts';
import inquirer from 'inquirer';

const PruneAccountsCommand = BaseCommand()
  .description('Remove accounts that are no longer active')
  .action(prune_accounts_action);

async function prune_accounts_action(options: GlobalOptions) {
  const command_helper = new CommandHelper(options);

  const invalidAccounts: Provider[] = [];
  for (const account of command_helper.providerStore.getProviders()) {
    const isValid = await account.testCredentials();
    if (!isValid) {
      invalidAccounts.push(account);
    }
  }

  if (invalidAccounts.length <= 0) {
    console.log('All accounts are active. Nothing to prune.');
    return;
  }

  console.log(`${invalidAccounts.length} accounts have invalid credentials.`);
  const { accountsToPrune } = await inquirer.prompt([
    {
      name: 'accountsToPrune',
      type: 'checkbox',
      message: 'Which accounts would you like to remove?',
      choices: invalidAccounts.map((account) => ({
        name: `${account.name} (${account.type})`,
        value: account.name,
      })),
    },
  ]);

  for (const accountName of accountsToPrune) {
    command_helper.providerStore.deleteProvider(accountName);
  }

  console.log(`${accountsToPrune.length} accounts removed successfully`);
}

export default PruneAccountsCommand;
