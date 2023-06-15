import { Construct } from 'constructs';
import * as path from 'std/path/mod.ts';
import { SensitiveFile, SensitiveFileConfig } from './.gen/providers/local/sensitive-file/index.ts';

type CreateProviderFileConstructor<T> = new (scope: Construct, id: string, config: SensitiveFileConfig) => T;

export const createProviderFileConstructor = (directory: string): CreateProviderFileConstructor<SensitiveFile> =>
  class extends SensitiveFile {
    constructor(scope: Construct, id: string, config: SensitiveFileConfig) {
      super(scope, id, {
        ...config,
        filename: path.join(directory, config.filename),
      });
    }
  };
