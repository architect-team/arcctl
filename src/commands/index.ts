import ApplyCommands from './apply/index.ts';
import { BaseCommand } from './base-command.ts';
import BuildCommands from './build/index.ts';
import DeployCommand from './deploy.ts';
import DestroyCommands from './destroy/index.ts';
import GetCommands from './get/index.ts';
import ListCommands from './list/index.ts';
import PushCommands from './push/index.ts';
import RemoveCommand from './remove.ts';
import SetCommands from './set/index.ts';
import ShowCommands from './show/index.ts';
import TagCommand from './tag.ts';
import TestCommands from './test/index.ts';

export default async function arcctl() {
  return BaseCommand()
    .command(ApplyCommands.getName(), ApplyCommands)
    .command(BuildCommands.getName(), BuildCommands)
    .command(DeployCommand.getName(), DeployCommand)
    .command(RemoveCommand.getName(), RemoveCommand)
    .command(TagCommand.getName(), TagCommand)
    .command(PushCommands.getName(), PushCommands)
    .command(SetCommands.getName(), SetCommands)
    .command(DestroyCommands.getName(), DestroyCommands)
    .command(GetCommands.getName(), GetCommands)
    .command(ListCommands.getName(), ListCommands)
    .command(TestCommands.getName(), TestCommands)
    .command(ShowCommands.getName(), ShowCommands)
    .parse(Deno.args);
}
