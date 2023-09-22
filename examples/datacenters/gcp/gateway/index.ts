import * as pulumi from "@pulumi/pulumi";
import * as gcp from '@pulumi/gcp';

const config = new pulumi.Config('gateway');

const http_proxy = new gcp.compute.TargetHttpProxy('load-balancer-http-proxy', {
  name: config.require('name'),
  urlMap: config.require('ingressRule'),
});

const ipAddress = new gcp.compute.GlobalAddress('load-balancer-ipaddress', {
  addressType: 'EXTERNAL',
});

new gcp.compute.GlobalForwardingRule('load-balancer-http-forwarding-rule', {
  name: config.require('name'),
  target: http_proxy.selfLink,
  ipAddress: ipAddress.address,
  portRange: '80',
  loadBalancingScheme: 'EXTERNAL', 
});

export const url = ipAddress.address;
