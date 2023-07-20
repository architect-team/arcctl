export type DatabaseClusterApplyOutputs = {
  protocol: string;
  host: string;
  port: number;
  username: string;
  password: string;
  certificate?: string;
};

export default DatabaseClusterApplyOutputs;
