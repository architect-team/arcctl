import { BaseCommand, CommandHelper, GlobalOptions } from '../base-command.ts';

const RemoveAccountCommand = BaseCommand()
  .alias('remove account')
  .alias('rm accounts')
  .alias('rm account')
  .description('Delete the specified account')
  .arguments('[name:string]')
  .action(remove_account_action);

async function remove_account_action(options: GlobalOptions, name?: string) {
  const command_helper = new CommandHelper(options);

  const provider = await command_helper.promptForAccount({
    account: name,
    message: 'Select the account to delete',
  });

  command_helper.providerStore.deleteProvider(provider.name);
  console.log('Account deleted');
}

export default RemoveAccountCommand;
