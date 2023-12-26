import { Logger } from 'winston';
import { DatacenterModule, parseModule } from '../modules/index.ts';
import { exec } from './command.ts';

export type ModuleBuildOptions = {
  logger?: Logger;
  platform?: string;
  tags?: string[];
  push?: boolean;
};

export const buildModuleFromDirectory = async (context: string, options?: ModuleBuildOptions): Promise<string> => {
  if (options?.push && (!options.tags || options.tags.length <= 0)) {
    throw new Error('Cannot push images without at least one tag');
  }

  let module_config: DatacenterModule;
  try {
    module_config = await parseModule(context);
  } catch (err) {
    throw new Error(`Failed to parse module: ${err.message}`);
  }

  const args = [
    'build',
    '--load',
  ];

  if (module_config.getDockerfile()) {
    args.push('--file', module_config.getDockerfile()!);
  }

  Object.entries(module_config.labels()).forEach(([key, value]) => {
    args.push('--label', `${key}=${value}`);
  });

  if (options?.push) {
    args.push('--push');
  }

  options?.tags?.forEach((tag) => {
    args.push('--tag', tag);
  });

  if (!options?.tags || options.tags.length <= 0) {
    // We'll need to extract the digest if there are no tags
    args.push('--quiet');
  }

  args.push(context);

  const { code, stdout } = await exec('docker', { args, logger: options?.logger });

  if (code !== 0) {
    console.log(args);
    throw new Error(`Failed to build the module at path: ${context}`);
  }

  if (!options?.tags || options.tags.length <= 0) {
    return stdout.trim();
  } else {
    return options.tags[0];
  }
};
