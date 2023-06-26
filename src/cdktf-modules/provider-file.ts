import { Construct } from 'constructs';
import * as path from 'std/path/mod.ts';
import { SensitiveFile, SensitiveFileConfig } from './.gen/providers/local/sensitive-file/index.ts';

export const createProviderFileConstructor = (
  directory: string,
): typeof SensitiveFile =>
  class extends SensitiveFile {
    constructor(scope: Construct, id: string, config: SensitiveFileConfig) {
      super(scope, id, {
        ...config,
        filename: path.join(directory, config.filename),
      });
    }
  };
