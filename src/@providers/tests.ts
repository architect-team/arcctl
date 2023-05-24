import { TerraformOutput } from 'npm:cdktf';
import {
  ResourceInputs,
  ResourceOutputs,
  ResourceType,
} from '../@resources/index.ts';
import { ProviderCredentials } from './credentials.ts';
import { ResourceModule, ResourceModuleHooks } from './module.ts';

export interface CldctlTestStack {
  inputs: ResourceInputs[ResourceType];
  serviceType: ResourceType;
  children?: CldctlTestStackOutputs[];
}

export interface CldctlTestStackOutputs extends CldctlTestStack {
  id?: string;
  module?: ResourceModule<any, ProviderCredentials>;
  imports?: Record<string, string>;
  tfOutputs?: TerraformOutput;
  outputs?: ResourceOutputs[ResourceType];
}

export interface CldctlTest<C extends Partial<ProviderCredentials>> {
  name: string;
  stacks: CldctlTestStack[];
  hooks?: ResourceModuleHooks;
  validateCreate?: (context: CldctlTestContext<C>) => Promise<void>;
  validateList?: (context: CldctlTestContext<C>) => Promise<void>;
  validateGet?: (context: CldctlTestContext<C>) => Promise<void>;
  validateDelete?: (context: CldctlTestContext<C>) => Promise<void>;
}

export type CldctlTestResource<C extends Partial<ProviderCredentials>> =
  CldctlTest<C>[];

export interface CldctlTestContext<C extends Partial<ProviderCredentials>> {
  stacks: CldctlTestStackOutputs[];
  credentials: C;
}
