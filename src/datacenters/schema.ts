import { Datacenter } from './datacenter.ts';
import datacenter_v1 from './v1/index.ts';

export type DatacenterSchema = {
  version: 'v1';
} & datacenter_v1;

export const buildDatacenter = (data: DatacenterSchema): Datacenter => {
  switch (data.version) {
    case 'v1': {
      return new datacenter_v1(data);
    }
  }
};
