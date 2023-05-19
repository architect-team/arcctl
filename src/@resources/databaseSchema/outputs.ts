export type DatabaseSchemaApplyOutputs = {
  protocol: string;
  host: string;
  port: string | number;
  name: string;
  url: string;
  provider: string;
  certificate?: string;
};

export default DatabaseSchemaApplyOutputs;
