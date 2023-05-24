import { BaseCommand } from '../base-command.ts';
import { Component, parseComponent } from '../components/index.ts';
import { ImageRepository } from 'npm:@architect-io/arc-oci';
import { Flags } from '@oclif/core';
import { execa } from 'execa';
import fs from 'fs';
import path from 'path';

export class BuildComponentCmd extends BaseCommand {
  static description = 'Build a component and relevant source services';

  static flags = {
    tag: Flags.string({
      char: 't',
      description: 'Tags to assign to the built image',
      multiple: true,
    }),
  };

  static args = [
    {
      name: 'context',
      description: 'Path to the component to build',
      required: true,
    },
  ];

  async run(): Promise<void> {
    const { args, flags } = await this.parse(BuildComponentCmd);

    const context = fs.lstatSync(args.context).isFile()
      ? path.dirname(args.context)
      : args.context;

    let component: Component;
    try {
      component = await parseComponent(args.context);
    } catch (err: any) {
      if (Array.isArray(err)) {
        for (const e of err) {
          this.log(e);
        }
        return;
      } else {
        this.error(err);
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

      buildArgs.push(path.join(process.cwd(), context, options.context));
      const { stdout } = await execa('docker', buildArgs);
      return stdout;
    });

    const digest = await this.componentStore.add(component);
    this.log(`Digest: ${digest}`);

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

        this.componentStore.tag(digest, tag);
        this.log(`Tagged: ${tag}`);
      }
    }
  }
}
