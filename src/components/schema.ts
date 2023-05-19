import component_v1 from './v1/index.js';
import component_v2 from './v2/index.js';

export type ComponentSchema =
  | ({
    version: 'v1';
  } & component_v1)
  | ({
    version: 'v2';
  } & component_v2)
;

export const buildComponent = (data: ComponentSchema) => {
  switch (data.version) {
    case 'v1': {
      return new component_v1(data);
    }
    case 'v2': {
      return new component_v2(data);
    }
  }
};
