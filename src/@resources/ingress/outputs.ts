export type IngressRuleOutputs = {
  protocol: string;
  host: string;
  port: string | number;
  username?: string;
  password?: string;
  url: string;
  path: string;
  subdomain: string;
  dns_zone: string;
};

export default IngressRuleOutputs;
