import { Provider } from '../@providers/index.js';
import { BaseCommand } from '../base-command.js';
import inquirer from 'inquirer';

export class PruneAccountsCmd extends BaseCommand {
  static description = 'Remove accounts that are no longer active';

  async run(): Promise<void> {
    const invalidAccounts: Provider[] = [];
    for (const account of this.providerStore.getProviders()) {
      const isValid = await account.testCredentials();
      if (!isValid) {
        invalidAccounts.push(account);
      }
    }

    if (invalidAccounts.length <= 0) {
      this.log('All accounts are active. Nothing to prune.');
      return;
    }

    this.log(`${invalidAccounts.length} accounts have invalid credentials.`);
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
      this.providerStore.deleteProvider(accountName);
    }

    this.log(`${accountsToPrune.length} accounts removed successfully`);
  }
}
