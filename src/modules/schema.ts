import { DatacenterModule } from './module.ts';
import module_v1 from './v1/index.ts';

/**
 * @discriminatorOpenApi version
 */
export type DatacenterModuleSchema =
  | ({
    version: 'v1';
  } & module_v1)
;

export const buildModule = (data: DatacenterModuleSchema): DatacenterModule => {
  switch (data.version) {
    case 'v1': {
      return new module_v1(data);
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
