export type IngressRuleOutputs = {
  host: string;
  dnsZone: string;
  port: string | number;
  username?: string;
  password?: string;
  url: string;
  path: string;
  loadBalancerHostname: string;
};

export default IngressRuleOutputs;
