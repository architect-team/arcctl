import * as gcp from '@pulumi/gcp';

const inputs = process.env.INPUTS;
if (!inputs) {
  throw new Error('Missing configuration. Please provide it via the INPUTS environment variable.');
}

type Config = {
  name: string;
  ingressRule: string;
};

const config: Config = JSON.parse(inputs);

const http_proxy = new gcp.compute.TargetHttpProxy('load-balancer-http-proxy', {
  name: config.name,
  urlMap: config.ingressRule,
});

const ipAddress = new gcp.compute.GlobalAddress('load-balancer-ipaddress', {
  addressType: 'EXTERNAL',
});

new gcp.compute.GlobalForwardingRule('load-balancer-http-forwarding-rule', {
  name: config.name,
  target: http_proxy.selfLink,
  ipAddress: ipAddress.address,
  portRange: '80',
  loadBalancingScheme: 'EXTERNAL', 
});

export const url = ipAddress.address;
