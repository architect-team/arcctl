import { Command } from 'cliffy/command/mod.ts';
// import BuildCommand from './commands/build.ts';
// import DeployCommand from './commands/deploy.ts';
// import TagCommand from './commands/tag.ts';
import AddAccountCommand from './commands/add/account.ts';

export default async function arcctl() {
  await new Command()
    .command('build', BuildCommand)
    .command('deploy', DeployCommand)
    .command('tag', TagCommand)
    .command('add:account', AddAccountCommand)
    .parse(Deno.args);
}
