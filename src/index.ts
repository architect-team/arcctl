import { Command } from 'cliffy/command/mod.ts';
import buildCommand from './commands/build.ts';
import deployCommand from './commands/deploy.ts';

await new Command().command('build', buildCommand).command('deploy', deployCommand).parse(Deno.args);
