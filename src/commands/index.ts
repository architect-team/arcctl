import AddCommands from './add/index.ts';
import ApplyCommands from './apply/index.ts';
import { BaseCommand } from './base-command.ts';
import BuildCommands from './build/index.ts';
import CreateCommands from './create/index.ts';
import DeployCommand from './deploy.ts';
import DestroyCommands from './destroy/index.ts';
import GetCommands from './get/index.ts';
import GraphCommand from './graph.ts';
import ListCommands from './list/index.ts';
import LogsCommand from './logs.ts';
import PruneAccountsCommand from './prune.ts';
import PushCommands from './push/index.ts';
import RemoveCommands from './remove/index.ts';
import SetCommands from './set/index.ts';
import TagCommand from './tag.ts';
import UpCommand from './up.ts';

export default async function arcctl() {
  const command = BaseCommand()
    .command('apply', ApplyCommands)
    .command('build', BuildCommands)
    .command('deploy', DeployCommand)
    .command('tag', TagCommand)
    .command('push', PushCommands)
    .command('set', SetCommands)
    .command('prune', PruneAccountsCommand)
    .command('add', AddCommands)
    .command('create', CreateCommands)
    .command('destroy', DestroyCommands)
    .command('graph', GraphCommand)
    .command('get', GetCommands)
    .command('list', ListCommands.alias('ls'))
    .command('remove', RemoveCommands.alias('rm'))
    .command('logs', LogsCommand)
    .command('up', UpCommand);

  // Print help when empty command is executed
  const finalCommand = command.reset().action(() => {
    command.showHelp();
  });

  await finalCommand.parse(Deno.args);
}
