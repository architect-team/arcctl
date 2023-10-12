import ApplyCommands from './apply/index.ts';
import { BaseCommand } from './base-command.ts';
import BuildCommands from './build/index.ts';
import DeployCommand from './deploy.ts';
import DestroyCommands from './destroy/index.ts';
import GetCommands from './get/index.ts';
import ListCommands from './list/index.ts';
import PushCommands from './push/index.ts';
import SetCommands from './set/index.ts';
import TagCommand from './tag.ts';

export default async function arcctl() {
  return BaseCommand()
    .command(ApplyCommands.getName(), ApplyCommands)
    .command(BuildCommands.getName(), BuildCommands)
    .command(DeployCommand.getName(), DeployCommand)
    .command(TagCommand.getName(), TagCommand)
    .command(PushCommands.getName(), PushCommands)
    .command(SetCommands.getName(), SetCommands)
    .command(DestroyCommands.getName(), DestroyCommands)
    .command(GetCommands.getName(), GetCommands)
    .command(ListCommands.getName(), ListCommands)
    .parse(Deno.args);
}
