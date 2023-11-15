import * as mod from 'https://deno.land/std@0.195.0/fs/copy.ts';
import * as path from 'std/path/mod.ts';
import { Component, parseComponent } from '../../components/index.ts';
import { verifyDocker } from '../../docker/helper.ts';
import { ImageRepository } from '../../oci/index.ts';
import { exec, execVerbose } from '../../utils/command.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from '../base-command.ts';

type BuildOptions = {
  tag?: string[];
  platform?: string;
  verbose: boolean;
  push: boolean;
} & GlobalOptions;

const getDigest = async (buildArgs: string[], verbose?: boolean): Promise<string> => {
  if (verbose) {
    const { code, stdout, stderr } = await execVerbose('docker', { args: buildArgs });

    if (code !== 0) {
      // Error is already displayed on screen for the user in verbose mode
      Deno.exit(code);
    }

    // Docker build seems to output progress to stderr?
    const merged_output = stdout + stderr;
    const matches = merged_output.match(/.*writing.*(sha256:\w+).*/);

    if (!matches || !matches[1]) {
      throw new Error('No digest found.');
    }
    return matches[1];
  } else {
    const { code, stdout, stderr } = await exec('docker', { args: buildArgs });
    if (code !== 0) {
      throw new Error(stderr);
    }
    return stdout.replace(/^\s+|\s+$/g, '');
  }
};

const ComponentBuildCommand = BaseCommand()
  .description('Build a component and relevant source services')
  .arguments('<context:string>') // 'Path to the component to build'
  .option('-t, --tag <tag:string>', 'Tags to assign to the built image', { collect: true })
  .option('-v, --verbose [verbose:boolean]', 'Turn on verbose logs', { default: false })
  .option('--platform <platform:string>', 'Target platform for the build')
  .option('--push [push:boolean]', 'Push the component to remote registries', { default: false })
  .action(async (options: BuildOptions, context_file: string) => {
    verifyDocker();
    const command_helper = new CommandHelper(options);
    const context = !Deno.lstatSync(context_file).isFile ? context_file : path.dirname(context_file);

    let component: Component;
    try {
      component = await parseComponent(context_file);
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

    if (options.push && (!options.tag || options.tag.length <= 0)) {
      console.error('Cannot use --push flag without at least one --tag');
      Deno.exit(1);
    }

    if (options.push) {
      for (const tag of options.tag || []) {
        const imageRepository = new ImageRepository(tag);
        component = await component.build(async (build_options) => {
          imageRepository.tag = imageRepository.tag + '-' + build_options.name;
          const build_args = ['build', '--push', '--tag', imageRepository.toString()];

          if (!options.verbose) {
            build_args.push('--quiet');
          }

          if (options.platform) {
            build_args.push('--platform', options.platform);
          }

          if (build_options.dockerfile) {
            build_args.push('--file', build_options.dockerfile);
          }

          if (build_options.target) {
            build_args.push('--target', build_options.target);
          }

          if (build_options.args) {
            for (const [key, value] of Object.entries(build_options.args)) {
              build_args.push('--build-arg', `${key}=${value}`);
            }
          }

          let build_context = build_options.context;
          if (!path.isAbsolute(build_context)) {
            build_context = path.join(Deno.cwd(), context, build_context);
          }
          build_args.push(build_context);
          await getDigest(build_args, options.verbose);
          return imageRepository.toString();
        }, async (build_options) => {
          imageRepository.tag = imageRepository.tag + '-' + build_options.deployment_name + '-volumes-' +
            build_options.volume_name;
          console.log(
            'Building image for volume',
            build_options.deployment_name + '.volumes.' + build_options.volume_name,
          );

          // Create the directory for the new volume container
          const tmpDir = await Deno.makeTempDir();
          await mod.copy(build_options.host_path, path.join(tmpDir, 'contents'));
          Deno.writeTextFileSync(
            path.join(tmpDir, 'Dockerfile'),
            `
          FROM alpine:latest
          WORKDIR /app
          COPY ./contents .
          CMD ["sh", "-c", "cp -r ./* $TARGET_DIR"]
        `,
          );

          // Publish the volume container
          const buildArgs = ['build', '--push', '--tag', imageRepository.toString()];
          if (options.verbose) {
            buildArgs.push('--quiet');
          }
          buildArgs.push(tmpDir);

          await getDigest(buildArgs, options.verbose);
          return imageRepository.toString();
        });

        // Tag and push the component itself
        const component_digest = await command_helper.componentStore.add(component);
        command_helper.componentStore.tag(component_digest, tag);
        await command_helper.componentStore.push(tag);
      }
    } else {
      component = await component.build(async (build_options) => {
        const buildArgs = ['build'];

        if (!options.verbose) {
          buildArgs.push('--quiet');
        }

        if (options.platform) {
          buildArgs.push('--platform', options.platform);
        }

        if (build_options.dockerfile) {
          buildArgs.push('--file', build_options.dockerfile);
        }

        if (build_options.target) {
          buildArgs.push('--target', build_options.target);
        }

        if (build_options.args) {
          for (const [key, value] of Object.entries(build_options.args)) {
            buildArgs.push('--build-arg', `${key}=${value}`);
          }
        }
        if (path.isAbsolute(build_options.context)) {
          buildArgs.push(build_options.context);
        } else {
          buildArgs.push(path.join(Deno.cwd(), context, build_options.context));
        }

        return getDigest(buildArgs, options.verbose);
      }, async (build_options) => {
        console.log(
          'Building image for volume',
          build_options.deployment_name + '.volumes.' + build_options.volume_name,
        );

        // Create the directory for the new volume container
        const tmpDir = await Deno.makeTempDir();
        await mod.copy(build_options.host_path, path.join(tmpDir, 'contents'));
        Deno.writeTextFileSync(
          path.join(tmpDir, 'Dockerfile'),
          `
          FROM alpine:latest
          WORKDIR /app
          COPY ./contents .
          CMD ["sh", "-c", "cp -r ./* $TARGET_DIR"]
        `,
        );

        // Publish the volume container
        const buildArgs = ['build'];
        if (options.verbose) {
          buildArgs.push('--quiet');
        }
        buildArgs.push(tmpDir);

        return getDigest(buildArgs, options.verbose);
      });

      const digest = await command_helper.componentStore.add(component);

      if (options.tag) {
        for (const tag of options.tag) {
          component = await component.tag(async (sourceRef: string, targetName: string) => {
            const imageRepository = new ImageRepository(tag);
            const targetRef = imageRepository.toString() + '-deployments-' + targetName;
            await exec('docker', { args: ['tag', sourceRef, targetRef] });
            console.log(`Deployment Tagged: ${targetRef}`);
            return targetRef;
          }, async (digest: string, deploymentName: string, volumeName: string) => {
            const imageRepository = new ImageRepository(tag);
            const targetRef = imageRepository.toString() + '-deployments-' + deploymentName + '-volumes-' + volumeName;

            await exec('docker', { args: ['tag', digest, targetRef] });
            console.log(`Volume Tagged: ${targetRef}`);
            return targetRef;
          });

          const component_digest = await command_helper.componentStore.add(component);
          command_helper.componentStore.tag(component_digest, tag);
          console.log(`Component Digest: ${component_digest}`);
          console.log(`Component Tagged: ${tag}`);
        }
      } else {
        console.log(`Digest: ${digest}`);
      }
    }
  });

export default ComponentBuildCommand;
