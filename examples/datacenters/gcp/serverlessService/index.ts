import * as gcp from "@pulumi/gcp";

const inputs = process.env.INPUTS;
if (!inputs) {
  throw new Error('Missing configuration. Please provide it via the INPUTS environment variable.');
}

type Config = {
  name: string;
  namespace: string;
  kubeconfig: string;
  data: string;
  username?: string;
  password?: string;
  target_port?: number;
  target_deployment: string;
  target_protocol?: string;
  labels?: Record<string, string>;
};

const config: Config = JSON.parse(inputs);

// Use the last 30 characters of the service name, as this is the more unique part.
const configName = config.name.replace(/\//g, '-').slice(-30);
const namespace = config.namespace.substring(0, 20);
// Max length for resource names is ~60 characters
const serviceName = `${namespace}--${configName}`;

const servicePort = config.target_port || 80;
const deploymentName = config.target_deployment.replace(/\//g, '-');
let targetProtocol = config.target_protocol;
if (!targetProtocol) {
  if (servicePort === 80) {
    targetProtocol = 'http';
  } else {
    targetProtocol = 'https';
  }
}

let region = '';
let zone = '';
if (config.labels?.region) {
  zone = config.labels.region;
  region = zone.split('-').slice(0, -1).join('-');
}

const functionName = `${namespace}-${deploymentName.slice(-20)}-${servicePort}`;

const serverlessNeg = new gcp.compute.RegionNetworkEndpointGroup('serverless-neg', {
  name: `${serviceName}--neg`,
  networkEndpointType: 'SERVERLESS',
  region,
  cloudRun: {
    service: functionName,
  },
});

const backend = new gcp.compute.BackendService('backend-neg', {
  name: `${serviceName}--backend`,
  backends: [{
    group: serverlessNeg.id,
  }],
  loadBalancingScheme: 'EXTERNAL_MANAGED',
  localityLbPolicy: 'ROUND_ROBIN',
});

export const id = backend.id;
export const protocol = backend.protocol;
export const host = functionName;
export const port = servicePort;
export const url = '';
export const username = config.username;
export const password = config.password;
export const name = serviceName;
export const target_port = servicePort;
