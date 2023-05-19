export type IngressRuleOutputs = {
  host: string;
  port: string | number;
  url: string;
  path: string;
  loadBalancerHostname: string;
};

export default IngressRuleOutputs;
