import { ProviderStore } from '../@providers/index.ts';
import { Logger } from 'winston';

export type ApplyOptions = {
  providerStore: ProviderStore;
  cwd?: string;
  logger?: Logger;
};

export type StepAction = 'no-op' | 'create' | 'update' | 'delete';

export type StepColor = 'blue' | 'green';

export type StepStatus = {
  state: 'pending' | 'starting' | 'applying' | 'destroying' | 'complete' | 'unknown' | 'error';
  message?: string;
  startTime?: number;
  endTime?: number;
};
