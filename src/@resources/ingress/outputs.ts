export type IngressRuleOutputs = {
  protocol: string;
  host: string;
  port: string | number;
  username?: string;
  password?: string;
  url: string;
  path: string;
};

export default IngressRuleOutputs;
