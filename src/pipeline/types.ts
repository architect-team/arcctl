import { Logger } from 'winston';
import { ProviderStore } from '../@providers/index.ts';

export type ApplyOptions = {
  providerStore: ProviderStore;
  cwd?: string;
  logger?: Logger;
};

export type StepAction = 'no-op' | 'create' | 'update' | 'delete';

export type StepColor = 'blue' | 'green';

export type StepStatusState = 'pending' | 'starting' | 'applying' | 'destroying' | 'complete' | 'unknown' | 'error';

export type StepStatus = {
  state: StepStatusState;
  message?: string;
  startTime?: number;
  endTime?: number;
};
