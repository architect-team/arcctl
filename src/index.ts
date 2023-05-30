import { Command } from 'cliffy/command/mod.ts';
import BuildCommand from './commands/build.ts';
import DeployCommand from './commands/deploy.ts';
import TagCommand from './commands/tag.ts';

await new Command()
  .command('build', BuildCommand)
  .command('deploy', DeployCommand)
  .command('tag', TagCommand)
  .parse(Deno.args);

console.log('ufh');
