import AddCommands from './add/index.ts';
import { BaseCommand } from './base-command.ts';
import BuildCommand from './build.ts';
import CreateCommands from './create/index.ts';
import DeployCommand from './deploy.ts';
import DestroyCommands from './destroy/index.ts';
import GetCommands from './get/index.ts';
import GraphCommand from './graph.ts';
import ListCommands from './list/index.ts';
import LogsCommand from './logs.ts';
import PruneAccountsCommand from './prune.ts';
import RemoveCommands from './remove/index.ts';
import TagCommand from './tag.ts';
import UpCommand from './up.ts';
import UpdateCommands from './update/index.ts';

export default async function arcctl() {
  const command = BaseCommand()
    .command('build', BuildCommand)
    .command('deploy', DeployCommand)
    .command('tag', TagCommand)
    .command('prune', PruneAccountsCommand)
    .command('add', AddCommands)
    .command('create', CreateCommands)
    .command('destroy', DestroyCommands)
    .command('graph', GraphCommand)
    .command('get', GetCommands)
    .command('list', ListCommands.alias('ls'))
    .command('remove', RemoveCommands.alias('rm'))
    .command('update', UpdateCommands)
    .command('logs', LogsCommand)
    .command('up', UpCommand);

  // Print help when empty command is executed
  const finalCommand = command.reset().action(() => {
    command.showHelp();
  });

  await finalCommand.parse(Deno.args);
}
