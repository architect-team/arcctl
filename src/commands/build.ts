import { BaseCommand, CommandHelper, GlobalOptions } from '../base-command.ts';
import { Component, parseComponent } from '../components/index.ts';
import { ImageRepository } from '@architect-io/arc-oci';
import { execa } from 'execa';
import * as path from 'std/path/mod.ts';

type BuildOptions = {
  tag?: string[];
} & GlobalOptions;

const buildCommand = BaseCommand()
  .description('Build a component and relevant source services')
  .arguments('<context:string>') // 'Path to the component to build'
  .option('-t, --tag <tag:string>', 'Tags to assign to the built image', { collect: true })
  .action(buildAction);

async function buildAction(options: BuildOptions, context_file: string): Promise<void> {
  const command_helper = new CommandHelper(options);
  const context = Deno.lstatSync(context_file).isFile ? context_file : path.dirname(context_file);

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
      console.error(err);
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

  const digest = await command_helper.componentStore.add(component);
  console.log(`Digest: ${digest}`);

  if (options.tag) {
    for (const tag of options.tag) {
      component.tag(async (sourceRef: string, targetName: string) => {
        const imageRepository = new ImageRepository(tag);
        const suffix = imageRepository.tag ? ':' + imageRepository.tag : '';
        const targetRef = path.join(imageRepository.registry, `${targetName}${suffix}`);

        await execa('docker', ['tag', sourceRef, targetRef]);
        return targetRef;
      });

      command_helper.componentStore.tag(digest, tag);
      console.log(`Tagged: ${tag}`);
    }
  }
}

export default buildCommand;
