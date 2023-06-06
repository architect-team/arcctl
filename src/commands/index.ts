import BuildCommand from './build.ts';
import DeployCommand from './deploy.ts';
import PruneAccountsCommand from './prune.ts';
import TagCommand from './tag.ts';
import AddCommands from './add/index.ts';
import CreateCommands from './create/index.ts';
import DestroyCommands from './destroy/index.ts';
import GetCommands from './get/index.ts';
import ListCommands from './list/index.ts';
import RemoveCommands from './remove/index.ts';
import UpdateCommands from './update/index.ts';
import { BaseCommand } from './base-command.ts';

export default async function arcctl() {
  const command = BaseCommand()
    .command('build', BuildCommand)
    .command('deploy', DeployCommand)
    .command('tag', TagCommand)
    .command('prune', PruneAccountsCommand)
    .command('add', AddCommands)
    .command('create', CreateCommands)
    .command('destroy', DestroyCommands)
    .command('get', GetCommands)
    .command('list', ListCommands.alias('ls'))
    .command('remove', RemoveCommands.alias('rm'))
    .command('update', UpdateCommands);

  // Print help when empty command is executed
  const finalCommand = command.reset().action(() => {
    command.showHelp();
  });

  await finalCommand.parse(Deno.args);
}
