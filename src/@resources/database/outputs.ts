export type DatabaseApplyOutputs = {
  protocol: string;
  host: string;
  port: number;
  username: string;
  password: string;
  certificate?: string;
};

export default DatabaseApplyOutputs;
