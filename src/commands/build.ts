import { ImageRepository } from '@architect-io/arc-oci';
import * as path from 'std/path/mod.ts';
import { Component, parseComponent } from '../components/index.ts';
import { exec } from '../utils/command.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from './base-command.ts';

type BuildOptions = {
  tag?: string[];
} & GlobalOptions;

const BuildCommand = BaseCommand()
  .description('Build a component and relevant source services')
  .arguments('<context:string>') // 'Path to the component to build'
  .option('-t, --tag <tag:string>', 'Tags to assign to the built image', { collect: true })
  .action(build_action);

async function build_action(options: BuildOptions, context_file: string): Promise<void> {
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
    if (path.isAbsolute(options.context)) {
      buildArgs.push(options.context);
    } else {
      buildArgs.push(path.join(Deno.cwd(), context, options.context));
    }
    const { code, stdout, stderr } = await exec('docker', { args: buildArgs });
    if (code !== 0) {
      throw new Error(stderr);
    }
    return stdout;
  }, async (options) => {
    return '';
  });

  const digest = await command_helper.componentStore.add(component);
  console.log(`Digest: ${digest}`);

  if (options.tag) {
    for (const tag of options.tag) {
      component.tag(async (sourceRef: string, targetName: string) => {
        const imageRepository = new ImageRepository(tag);
        const suffix = imageRepository.tag ? ':' + imageRepository.tag : '';
        const targetRef = path.join(imageRepository.registry, `${targetName}${suffix}`);

        await exec('docker', { args: ['tag', sourceRef, targetRef] });
        return targetRef;
      });

      command_helper.componentStore.tag(digest, tag);
      console.log(`Tagged: ${tag}`);
    }
  }
}

export default BuildCommand;
