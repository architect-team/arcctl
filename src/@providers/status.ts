export type ResourceStatus = {
  state:
  | 'pending'
  | 'initializing'
  | 'creating'
  | 'created'
  | 'updating'
  | 'deleting'
  | 'complete'
  | 'unknown'
  | 'error';
  message?: string;
};
