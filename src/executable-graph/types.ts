export type NodeStatus = {
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

export type NodeAction = 'no-op' | 'create' | 'update' | 'delete';

export type NodeColor = 'blue' | 'green';
