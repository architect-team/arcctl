export type StepStatus = {
  state:
    | 'pending'
    | 'starting'
    | 'applying'
    | 'destroying'
    | 'complete'
    | 'unknown'
    | 'error';
  message?: string;
  startTime?: number;
  endTime?: number;
};

export type StepAction = 'no-op' | 'create' | 'update' | 'delete';

export type NodeColor = 'blue' | 'green';
