import { existsSync } from 'std/fs/exists.ts';

export const pathExistsSync = (path: string): boolean => {
  let directory_exists = false;
  try {
    if (existsSync(path)) {
      directory_exists = true;
    }
  } catch {
    // ignore error if directory doesn't exist as existsSync will throw an error - https://github.com/denoland/deno_std/issues/1216, https://github.com/denoland/deno_std/issues/2494
  }
  return directory_exists;
};

// TODO: throw a testing error or something if existsSync is used?
