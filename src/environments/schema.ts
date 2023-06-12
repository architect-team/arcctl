import { Environment } from './environment.ts';
import environment_v1 from './v1/index.ts';

/**
 * @discriminatorOpenApi version
 */
export type EnvironmentSchema =
  | ({
    version: 'v1';
  } & environment_v1)
;

export const buildEnvironment = (data: EnvironmentSchema): Environment => {
  switch (data.version) {
    case 'v1': {
      return new environment_v1(data);
    }
    default: {
      throw new Error(
        `Invalid schema version: ${
          'version' in data ? data.version : 'none'
        }`
      );
    }
  }
};
