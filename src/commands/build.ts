import {
  BaseCommand,
  CommandHelper,
  ParentCommandGlobals,
} from '../base-command.ts';
import { Component, parseComponent } from '../components/index.ts';
import { ImageRepository } from '@architect-io/arc-oci';
import { execa } from 'execa';
import * as path from 'std/path/mod.ts';

type BuildComponentFlags = {
  tag: string;
};

async function run(
  flags: ParentCommandGlobals & BuildComponentFlags,
  context_file: string,
): Promise<void> {
  const context = Deno.lstatSync(context_file).isFile
    ? path.dirname(context_file)
    : context_file;

  let component: Component;
  try {
    component = await parseComponent(context);
  } catch (err: unknown) {
    if (Array.isArray(err)) {
      for (const e of err) {
        console.log(e);
      }
      return;
    } else {
      console.error(err); // TODO: this should exit
      Deno.exit(1);
    }
  }

  component = await component.build(async (options) => {
    const buildArgs = ['build', '--quiet'];
    if (options.dockerfile) {
      buildArgs.push('--file', options.dockerfile);
    }

    if (options.target) {
      buildArgs.push('--target', options.target);
    }

    if (options.args) {
      for (const [key, value] of Object.entries(options.args)) {
        buildArgs.push('--build-arg', `${key}=${value}`);
      }
    }
    buildArgs.push(path.join(Deno.cwd(), context, options.context));
    const { stdout } = await execa('docker', buildArgs);
    return stdout;
  });

  const command_helper = new CommandHelper();
  const digest = await command_helper.componentStore.add(component);
  console.log(`Digest: ${digest}`);

  if (flags.tag) {
    for (const tag of flags.tag) {
      component.tag(async (sourceRef: string, targetName: string) => {
        const imageRepository = new ImageRepository(tag);
        const suffix = imageRepository.tag ? ':' + imageRepository.tag : '';
        const targetRef = path.join(
          imageRepository.registry,
          `${targetName}${suffix}`,
        );

        await execa('docker', ['tag', sourceRef, targetRef]);
        return targetRef;
      });

      command_helper.componentStore.tag(digest, tag);
      console.log(`Tagged: ${tag}`);
    }
  }
}
export class BuildComponentCmd extends BaseCommand<
  BuildComponentFlags,
  [string]
> {
  static command_name = 'build';
  static command_description = 'Build a component and relevant source services';

  // static flags = {
  //   tag: Flags.string({
  //     char: 't',
  //     description: 'Tags to assign to the built image',
  //     multiple: true,
  //   }),
  // };

  // static args = [
  //   {
  //     name: 'context',
  //     description: 'Path to the component to build',
  //     required: true,
  //   },
  // ];

  constructor() {
    super();
    return this.option(
      '-t, --tag <tag:string>',
      'Tags to assign to the built image',
    )
      .arguments('<context:string>') // 'Path to the component to build'
      .action(async (options, context) => {
        await run(options, context);
      });
  }
}
