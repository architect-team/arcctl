import { Command } from 'https://deno.land/x/cliffy@v0.25.7/command/mod.ts';
import { BuildComponentCmd } from './commands/build.ts';

await new Command()
  .globalEnv('XDG_CONFIG=<value:string>', 'Configuration folder location.', {
    prefix: 'XDG_',
  })
  .command('build', new BuildComponentCmd())
  .parse(Deno.args);
