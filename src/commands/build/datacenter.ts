import { isAbsolute } from 'https://deno.land/std@0.50.0/path/posix.ts';
import * as path from 'std/path/mod.ts';
import winston from 'winston';
import { ModuleServer } from '../../datacenter-modules/server.ts';
import { Datacenter } from '../../datacenters/datacenter.ts';
import { parseDatacenter } from '../../datacenters/parser.ts';
import { verifyDocker } from '../../docker/helper.ts';
import { ImageRepository } from '../../oci/index.ts';
import { exec } from '../../utils/command.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from '../base-command.ts';

type BuildOptions = {
  tag?: string[];
  verbose: boolean;
} & GlobalOptions;

const DatacenterBuildCommand = BaseCommand()
  .description('Build a datacenter and relevant modules')
  .arguments('<context:string>') // 'Path to the datacenter to build'
  .option('-t, --tag <tag:string>', 'Tags to assign to the built image', { collect: true })
  .option('-v, --verbose [verbose:boolean]', 'Turn on verbose logs', { default: false })
  .action(build_action);

async function build_action(options: BuildOptions, context_file: string): Promise<void> {
  verifyDocker();
  const command_helper = new CommandHelper(options);

  const logger = options.verbose
    ? winston.createLogger({
      level: 'info',
      format: winston.format.printf(({ message }) => message),
      transports: [new winston.transports.Console()],
    })
    : undefined;

  const context_relative = !Deno.lstatSync(context_file).isFile ? context_file : path.dirname(context_file);
  const context = isAbsolute(context_relative) ? context_relative : path.join(Deno.cwd(), context_relative);
  let datacenter: Datacenter;
  try {
    datacenter = await parseDatacenter(context_file);
  } catch (err: unknown) {
    if (Array.isArray(err)) {
      for (const e of err) {
        console.log(e);
      }
      Deno.exit(1);
    } else {
      console.error(err);
      Deno.exit(1);
    }
  }

  datacenter = await datacenter.build(async (build_options) => {
    // An absolute path is set as build_options.context when building from a git repo.
    const build_dir = path.isAbsolute(build_options.context)
      ? build_options.context
      : path.join(context, build_options.context);
    console.log(`Building module: ${build_dir}`);
    const server = new ModuleServer(build_options.plugin);
    const client = await server.start(build_dir);
    try {
      const build = await client.build({ directory: build_dir }, { logger });
      client.close();
      await server.stop();
      return build.image;
    } catch (e) {
      client.close();
      await server.stop();
      throw new Error(e);
    }
  });

  const digest = await command_helper.datacenterStore.add(datacenter);

  if (options.tag) {
    for (const tag of options.tag) {
      datacenter = await datacenter.tag(async (sourceRef: string, targetName: string) => {
        const imageRepository = new ImageRepository(tag);
        const targetRef = imageRepository.toString() + '-modules-' + targetName;
        await exec('docker', { args: ['tag', sourceRef, targetRef] });
        console.log(`Module Tagged: ${targetRef}`);
        return targetRef;
      });

      const datacenter_digest = await command_helper.datacenterStore.add(datacenter);
      command_helper.datacenterStore.tag(datacenter_digest, tag);
      console.log(`Datacenter Digest: ${datacenter_digest}`);
      console.log(`Datacenter Tagged: ${tag}`);
    }
  } else {
    console.log(`Digest: ${digest}`);
  }
}

export default DatacenterBuildCommand;
