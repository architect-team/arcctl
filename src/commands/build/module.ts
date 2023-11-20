import { isAbsolute } from 'https://deno.land/std@0.50.0/path/posix.ts';
import * as path from 'std/path/mod.ts';
import { ModuleServer } from '../../datacenter-modules/server.ts';
import { isPlugin, PluginArray } from '../../datacenter-modules/types.ts';
import { verifyDocker } from '../../docker/helper.ts';
import { ImageRepository } from '../../oci/index.ts';
import { exec } from '../../utils/command.ts';
import { BaseCommand, GlobalOptions } from '../base-command.ts';
import { module_push_action } from '../push/module.ts';

type BuildOptions = {
  tag?: string[];
  name?: string;
  platform?: string;
  plugin: string;
  push: boolean;
  verbose: boolean;
} & GlobalOptions;

const ModuleBuildCommand = BaseCommand()
  .description('Build a module for use within a datacenter')
  .arguments('<context:string>') // 'Path to the module to build'
  .option('-n, --name <module_name:string>', 'Name of this module image')
  .option('-p, --plugin <plugin:string>', 'Plugin this module is built with', { default: 'pulumi' })
  .option('-t, --tag <tag:string>', 'Tags to assign to the built module image', { collect: true })
  .option('--platform <platform:string>', 'Target platform for the build')
  .option('--push [push:boolean]', 'Push the tagged images after buliding', { default: false })
  .option('-v, --verbose [verbose:boolean]', 'Turn on verbose logs', { default: false })
  .action(build_action);

async function build_action(options: BuildOptions, context_file: string): Promise<void> {
  verifyDocker();
  if (!isPlugin(options.plugin)) {
    console.log(`Invalid value for plugin: ${options.plugin}. Valid plugin values: ${PluginArray.join(', ')}`);
    Deno.exit(1);
  }

  if (options.push && (!options.tag || options.tag.length <= 0)) {
    console.error('Cannot use --push flag without at least one --tag');
    Deno.exit(1);
  }

  const context_relative = !Deno.lstatSync(context_file).isFile ? context_file : path.dirname(context_file);
  const context = isAbsolute(context_relative) ? context_relative : path.join(Deno.cwd(), context_relative);
  // Default module name to being the folder name of the module
  const module_name = options.name || context.split(path.SEP).at(-1) || 'module';

  console.log(`Building module ${module_name} at: ${context}`);

  const server = new ModuleServer(options.plugin);
  const client = await server.start(context);
  let image;
  try {
    const build = await client.build({ directory: context, platform: options.platform });
    client.close();
    await server.stop();
    image = build.image;
  } catch (e) {
    client.close();
    await server.stop();
    throw new Error(e);
  }

  if (options.tag) {
    for (const tag of options.tag) {
      const imageRepository = new ImageRepository(`${module_name}:${tag}`);
      await exec('docker', { args: ['tag', image, imageRepository.toString()] });
      console.log(`Module Tagged: ${imageRepository.toString()}`);

      if (options.push) {
        module_push_action({ verbose: options.verbose }, imageRepository.toString());
      }
    }
  }
}

export default ModuleBuildCommand;
