import { Command } from 'cliffy/command/mod.ts';
import buildCommand from './commands/build.ts';

await new Command().command('build', buildCommand).parse(Deno.args);
