import * as gcp from "@pulumi/gcp";
import * as pulumi from "@pulumi/pulumi";

const inputs = process.env.INPUTS;
if (!inputs) {
  throw new Error('Missing configuration. Please provide it via the INPUTS environment variable.');
}

type Config = {
  name: string;
  namespace: string;
  target_port?: string;
  target_deployment: string;
  target_protocol?: string;
  labels?: Record<string, string>;
  username?: string;
  password?: string;
};

const config: Config = JSON.parse(inputs);

const gcpConfig = new pulumi.Config('gcp');

// Use the last 30 characters of the service name, as this is the more unique part.
const configName = config.name.replace(/\//g, '-').slice(-30);
const namespace = config.namespace.substring(0, 20);

// Max length for resource names is ~60 characters
const serviceName = `${namespace}--${configName}`;

const defaultServicePort = '80';
const servicePort = config.target_port || defaultServicePort;
const deploymentName = config.target_deployment.replace(/\//g, '-');
let targetProtocol = config.target_protocol;

if (!targetProtocol) {
  if (servicePort === defaultServicePort) {
    targetProtocol = 'http';
  } else {
    targetProtocol = 'https';
  }
}

const labelsObject = config.labels;
let zone = '';
if (labelsObject) {
  zone = labelsObject.region;
}

// This deployment is a GCE instance, so we need to set firewall rules that allow routing to it
const gceName = `${namespace}-${deploymentName.slice(-40)}`;
const vpcName = labelsObject?.vpc;

new gcp.compute.Firewall('service-firewall', {
  name: `${gceName.substring(0, 48)}-firewall-${servicePort}`.toLowerCase(),
  allows: [{ 
    protocol: 'tcp', 
    ports: [
      `${servicePort}`,
       // '22', enables ssh
       '80' 
      ]  
  }],
  network: vpcName,
  // targetTags: [gceName.toLowerCase()], // TODO: replace? removed to enable ssh
  sourceRanges: ['0.0.0.0/0'], // TODO: replace/tighten? removed/edited to enable ssh
});

// Internal host names: https://cloud.google.com/compute/docs/internal-dns#about_internal_dns
const serviceHost = `${gceName}.${zone}.c.${gcpConfig.require('project')}.internal`;
let serviceUrl = '';
if (config.username && config.password) {
  serviceUrl = `${targetProtocol}://${config.username}:${config.password}@${serviceHost}:${servicePort}`;
} else {
  serviceUrl = `${targetProtocol}://${serviceHost}:${servicePort}`;
}

const healthCheck = new gcp.compute.HealthCheck('health-check', {
  name: config.name, 
  checkIntervalSec: 1,
  httpHealthCheck: {
      port: parseInt(servicePort),
  },
  timeoutSec: 1,
});

const backendServiceNameSplit = config.target_deployment.split('/');
const backendServiceName = backendServiceNameSplit[backendServiceNameSplit.length - 1];
const backendService = new gcp.compute.BackendService('backend-service', {
  name: backendServiceName,
  backends: [{ group: config.target_deployment }],
  healthChecks: healthCheck.selfLink,
});

export const id = backendService.selfLink;
export const protocol = targetProtocol;
export const host = serviceHost;
export const port = servicePort;
export const url = serviceUrl;
export const username = config.username;
export const password = config.password;
export const name = serviceName;
export const target_port = servicePort;
