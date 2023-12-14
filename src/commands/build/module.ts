import { isAbsolute } from 'https://deno.land/std@0.50.0/path/posix.ts';
import * as path from 'std/path/mod.ts';
import winston from 'winston';
import { verifyDocker } from '../../docker/helper.ts';
import { buildModuleFromDirectory } from '../../utils/build.ts';
import { BaseCommand, GlobalOptions } from '../base-command.ts';

type BuildOptions = {
  tag?: string[];
  name?: string;
  platform?: string;
  push: boolean;
  verbose: boolean;
} & GlobalOptions;

const ModuleBuildCommand = BaseCommand()
  .description('Build a module for use within a datacenter')
  .arguments('<context:string>') // 'Path to the module to build'
  .option('-n, --name <module_name:string>', 'Name of this module image')
  .option('-t, --tag <tag:string>', 'Tags to assign to the built module image', { collect: true })
  .option('--platform <platform:string>', 'Target platform for the build')
  .option('--push [push:boolean]', 'Push the tagged images after buliding', { default: false })
  .option('-v, --verbose [verbose:boolean]', 'Turn on verbose logs', { default: false })
  .action(async (options: BuildOptions, context_file: string) => {
    verifyDocker();

    if (options.push && (!options.tag || options.tag.length <= 0)) {
      console.error('Cannot use --push flag without at least one --tag');
      Deno.exit(1);
    }

    const logger = options.verbose
      ? winston.createLogger({
        level: 'info',
        format: winston.format.printf(({ message }) => message),
        transports: [new winston.transports.Console()],
      })
      : undefined;

    const context_relative = !Deno.lstatSync(context_file).isFile ? context_file : path.dirname(context_file);
    const context = isAbsolute(context_relative) ? context_relative : path.join(Deno.cwd(), context_relative);
    // Default module name to being the folder name of the module
    const module_name = options.name || context.split(path.SEP).at(-1) || 'module';

    console.log(`Building module ${module_name} at: ${context}`);
    try {
      await buildModuleFromDirectory(context, {
        logger,
        platform: options.platform,
        tags: options.tag,
        push: options.push,
      });

      console.log('%cBuild successful', 'color: green');
    } catch (err) {
      console.error('%cBuild failed', 'color: red');
      console.error(err.message);
      Deno.exit(1);
    }
  });

export default ModuleBuildCommand;
