import type cronjobInputs from './cronjob/inputs.ts';
import type cronjobOutputs from './cronjob/outputs.ts';
import type databaseInputs from './database/inputs.ts';
import type databaseOutputs from './database/outputs.ts';
import type databaseUserInputs from './databaseUser/inputs.ts';
import type databaseUserOutputs from './databaseUser/outputs.ts';
import type deploymentInputs from './deployment/inputs.ts';
import type deploymentOutputs from './deployment/outputs.ts';
import type dockerBuildInputs from './dockerBuild/inputs.ts';
import type dockerBuildOutputs from './dockerBuild/outputs.ts';
import type ingressInputs from './ingress/inputs.ts';
import type ingressOutputs from './ingress/outputs.ts';
import type secretInputs from './secret/inputs.ts';
import type secretOutputs from './secret/outputs.ts';
import type serviceInputs from './service/inputs.ts';
import type serviceOutputs from './service/outputs.ts';
import type volumeInputs from './volume/inputs.ts';
import type volumeOutputs from './volume/outputs.ts';

export type ResourceType =
  | 'cronjob'
  | 'database'
  | 'databaseUser'
  | 'deployment'
  | 'dockerBuild'
  | 'ingress'
  | 'secret'
  | 'service'
  | 'volume';

export const ResourceTypeList: ResourceType[] = [
  'cronjob',
  'database',
  'databaseUser',
  'deployment',
  'dockerBuild',
  'ingress',
  'secret',
  'service',
  'volume',
];

export type ResourceInputs = {
  'cronjob': cronjobInputs;
  'database': databaseInputs;
  'databaseUser': databaseUserInputs;
  'deployment': deploymentInputs;
  'dockerBuild': dockerBuildInputs;
  'ingress': ingressInputs;
  'secret': secretInputs;
  'service': serviceInputs;
  'volume': volumeInputs;
};

export type ResourceOutputs = {
  'cronjob': cronjobOutputs;
  'database': databaseOutputs;
  'databaseUser': databaseUserOutputs;
  'deployment': deploymentOutputs;
  'dockerBuild': dockerBuildOutputs;
  'ingress': ingressOutputs;
  'secret': secretOutputs;
  'service': serviceOutputs;
  'volume': volumeOutputs;
};

/**
 * @discriminator type
 */
export type InputSchema = ResourceInputs[ResourceType];

export type OutputSchema = ResourceOutputs[ResourceType];
