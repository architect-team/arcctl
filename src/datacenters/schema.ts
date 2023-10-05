import { Datacenter } from './datacenter.ts';
import { default as datacenter_v1, default as datacenter_v2 } from './v1/index.ts';

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
