import { Command } from 'cliffy/command/mod.ts';
import BuildCommand from './commands/build.ts';
import DeployCommand from './commands/deploy.ts';
import TagCommand from './commands/tag.ts';
import AddAccountCommand from './commands/add/account.ts';
import CreateDatacenterCommand from './commands/create/datacenter.ts';
import CreateEnvironmentCommand from './commands/create/environment.ts';
import CreateResourceCommand from './commands/create/index.ts';
import DestroyResourceCommand from './commands/destroy/index.ts';
import DestroyDatacenterCommand from './commands/destroy/datacenter.ts';
import DestroyEnvironmentCommand from './commands/destroy/environment.ts';

export default async function arcctl() {
  await new Command()
    .command('build', BuildCommand)
    .command('deploy', DeployCommand)
    .command('tag', TagCommand)
    .command('add:account', AddAccountCommand)
    .command('create:datacenter', CreateDatacenterCommand)
    .command('create:environment', CreateEnvironmentCommand)
    .command('create', CreateResourceCommand)
    .command('destroy', DestroyResourceCommand)
    .command('destroy:datacenter', DestroyDatacenterCommand)
    .command('destroy:environment', DestroyEnvironmentCommand)
    .parse(Deno.args);
}
