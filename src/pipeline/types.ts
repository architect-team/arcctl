import { ProviderStore } from '../@providers/index.ts';
import { Terraform } from '../terraform/terraform.ts';
import { Logger } from 'winston';

export type ApplyOptions = {
  providerStore: ProviderStore;
  cwd?: string;
  logger?: Logger;
};

export type ApplyStepOptions = ApplyOptions & {
  terraform: Terraform;
};

export type StepAction = 'no-op' | 'create' | 'update' | 'delete';

export type StepColor = 'blue' | 'green';

export type StepStatus = {
  state: 'pending' | 'starting' | 'applying' | 'destroying' | 'complete' | 'unknown' | 'error';
  message?: string;
  startTime?: number;
  endTime?: number;
};
