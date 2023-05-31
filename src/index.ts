import { Command } from 'cliffy/command/mod.ts';
import AddAccountCommand from './commands/add/account.ts';
import BuildCommand from './commands/build.ts';
import CreateDatacenterCommand from './commands/create/datacenter.ts';
import CreateEnvironmentCommand from './commands/create/environment.ts';
import CreateResourceCommand from './commands/create/index.ts';
import DeployCommand from './commands/deploy.ts';
import TagCommand from './commands/tag.ts';

export default async function arcctl() {
  await new Command()
    .command('build', BuildCommand)
    .command('deploy', DeployCommand)
    .command('tag', TagCommand)
    .command('add:account', AddAccountCommand)
    .command('create:datacenter', CreateDatacenterCommand)
    .command('create:environment', CreateEnvironmentCommand)
    .command('create', CreateResourceCommand)
    .parse(Deno.args);
}

export * from './@providers/index.ts';
export * from './@resources/index.ts';
export * from './cloud-graph/index.ts';
export * from './component-store/index.ts';
export * from './components/index.ts';
export * from './datacenters/index.ts';
export * from './environments/index.ts';
export * from './pipeline/index.ts';
export * from './utils/index.ts';
