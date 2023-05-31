import { Command } from 'cliffy/command/mod.ts';
import BuildCommand from './commands/build.ts';
import DeployCommand from './commands/deploy.ts';
import PruneAccountsCommand from './commands/prune.ts';
import TagCommand from './commands/tag.ts';
import AddAccountCommand from './commands/add/account.ts';
import CreateDatacenterCommand from './commands/create/datacenter.ts';
import CreateEnvironmentCommand from './commands/create/environment.ts';
import CreateResourceCommand from './commands/create/index.ts';
import DestroyResourceCommand from './commands/destroy/index.ts';
import DestroyDatacenterCommand from './commands/destroy/datacenter.ts';
import DestroyEnvironmentCommand from './commands/destroy/environment.ts';
import GetResourceCommand from './commands/get/index.ts';
import GetAccountCommand from './commands/get/account.ts';
import GetComponentManifestCommand from './commands/get/component.ts';
import ListResourceCommand from './commands/list/index.ts';
import ListAllResourcesCommand from './commands/list/all.ts';
import ListAccountCommand from './commands/list/accounts.ts';
import ListEnvironmentCommand from './commands/list/environments.ts';
import ListDatacenterCommand from './commands/list/datacenters.ts';
import RemoveAccountCommand from './commands/remove/account.ts';
import UpdateDatacenterCommand from './commands/update/datacenter.ts';
import UpdateEnvironmentCommand from './commands/update/environment.ts';

export default async function arcctl() {
  await new Command()
    .command('build', BuildCommand)
    .command('deploy', DeployCommand)
    .command('tag', TagCommand)
    .command('prune', PruneAccountsCommand)
    .command('add:account', AddAccountCommand)
    .command('create:datacenter', CreateDatacenterCommand)
    .command('create:environment', CreateEnvironmentCommand)
    .command('create', CreateResourceCommand)
    .command('destroy', DestroyResourceCommand)
    .command('destroy:datacenter', DestroyDatacenterCommand)
    .command('destroy:environment', DestroyEnvironmentCommand)
    .command('get', GetResourceCommand)
    .command('get:account', GetAccountCommand)
    .command('get:component', GetComponentManifestCommand)
    .command('list', ListResourceCommand)
    .command('list:all', ListAllResourcesCommand)
    .command('list:account', ListAccountCommand)
    .command('list:environment', ListEnvironmentCommand)
    .command('list:datacenter', ListDatacenterCommand)
    .command('remove:account', RemoveAccountCommand)
    .command('update:datacenter', UpdateDatacenterCommand)
    .command('update:environment', UpdateEnvironmentCommand)
    .parse(Deno.args);
}
