export type DatabaseUserApplyOutputs = {
  protocol: string;
  host: string;
  port: number | string;
  database: string;
  username: string;
  password: string;
  url: string;
  certificate?: string;
};

export default DatabaseUserApplyOutputs;
