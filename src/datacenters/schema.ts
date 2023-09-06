import { Datacenter } from './datacenter.ts';
import datacenter_v1 from './v1/index.ts';
import datacenter_v2 from './v2/index.ts';

export type DatacenterSchema = {
  version: 'v1';
} & datacenter_v1;

export const buildDatacenter = (data: DatacenterSchema): Datacenter => {
  const datacenters = {
    'v1': datacenter_v1,
    'v2': datacenter_v2,
  };
  return new datacenters[data.version](data);
};
