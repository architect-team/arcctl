import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

const config = new pulumi.Config('serverlessService');

// Use the last 30 characters of the service name, as this is the more unique part.
const configName = config.require('name').replace(/\//g, '-').slice(-30);
const namespace = config.require('namespace').substring(0, 20);
// Max length for resource names is ~60 characters
const serviceName = `${namespace}--${configName}`;

const servicePort = config.get('target_port') || 80;
const deploymentName = config.require('target_deployment').replace(/\//g, '-');
let targetProtocol = config.get('target_protocol');
if (!targetProtocol) {
  if (servicePort === 80) {
    targetProtocol = 'http';
  } else {
    targetProtocol = 'https';
  }
}

let labelsObject;
try {
  const labels = config.get('labels');
  if (labels) {
    labelsObject = JSON.parse(labels);
  }
} catch (err) {
  throw new Error('Could not parse labels config object');
}
let region = '';
let zone = '';
if (labelsObject) {
  zone = labelsObject.region;
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
export const username = config.require('username');
export const password = config.require('password');
export const name = serviceName;
export const target_port = servicePort;
