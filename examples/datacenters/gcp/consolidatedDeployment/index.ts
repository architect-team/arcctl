import * as gcp from "@pulumi/gcp";
import * as pulumi from "@pulumi/pulumi";
import * as yaml from 'js-yaml';

const config = new pulumi.Config('gceDeployment');

const namespace = (config.get('namespace') || 'ns').substring(0, 20);
const name = config.require('name').replace(/\//g, '-');

const entrypoint = config.get('entrypoint');
const command = config.get('command');
let environment;
try {
  if (config.get('environment')) {
    environment = JSON.parse(config.require('environment'));
  }
} catch (err) { 
  throw new Error('Could not parse environment object');
}
const env = Object.entries(environment || {}).map(([key, value]) => ({
  name: key,
  value: String(value),
}));

const container = {
  spec: {
    containers: [{
      image: config.require('image'),
      args: typeof entrypoint === 'string' ? entrypoint.split(' ') : entrypoint,
      command: typeof command === 'string' ? command.split(' ') : command,
      env
    }]
  }
};

const computeImage = await gcp.compute.getImage({
  family: 'cos-stable',
  project: 'cos-cloud'
});

const _gceDeploymentService = new gcp.projects.Service('gce-deployment', {
  service: 'compute.googleapis.com',
  disableOnDestroy: false,
});

const deploymentName = `${namespace}-${name}`;
const vpcName = config.require('vpc');
const zone = config.require('zone');
const deployment = new gcp.compute.Instance('gce-deployment', {
  name: deploymentName,
  zone,
  tags: [deploymentName],
  machineType: config.require('instanceType'),
  bootDisk: {
    initializeParams: {
      image: computeImage.selfLink
    }
  },
  networkInterfaces: [{
    network: vpcName,
    subnetwork: `${vpcName}-subnet`,
    accessConfigs: [{}]
  }],
  labels: {
    'container-vm': computeImage.name
  },
  metadata: {
    'gce-container-declaration': yaml.dump(container)
  }
}, {
  dependsOn: [_gceDeploymentService]
});

const protocol = config.require('protocol');
const servicePort = config.require('port');
const instanceGroup = new gcp.compute.InstanceGroup('gce-deployment-instance-group',  {
  name: deploymentName,
  instances: [deployment.selfLink],
  zone,
  namedPorts: [{
    name: protocol,
    port: parseInt(servicePort)
  }]
});

const healthCheck = new gcp.compute.HealthCheck('health-check', {
  name, 
  checkIntervalSec: 1,
  httpHealthCheck: {
    port: parseInt(servicePort),
  },
  timeoutSec: 1,
});

const backendService = new gcp.compute.BackendService('backend-service', {
  name,
  backends: [{ group: instanceGroup.selfLink }],
  healthChecks: healthCheck.selfLink,
});

const https_paths = new gcp.compute.URLMap('service-https-url-map', {
  name,
  defaultService: backendService.selfLink,
});

const http_proxy = new gcp.compute.TargetHttpProxy('load-balancer-http-proxy', {
  name,
  urlMap: https_paths.selfLink,
});

const ipAddress = new gcp.compute.GlobalAddress('load-balancer-ipaddress', {
  addressType: 'EXTERNAL',
});

new gcp.compute.GlobalForwardingRule('load-balancer-http-forwarding-rule', {
  name,
  target: http_proxy.selfLink,
  ipAddress: ipAddress.address,
  portRange: '80',
  loadBalancingScheme: 'EXTERNAL', 
});

const firewall = new gcp.compute.Firewall('service-firewall', {
  name,
  direction: 'INGRESS',
  allows: [{ 
    protocol: 'tcp', 
    ports: [`${servicePort}`, '80']
  }],
  network: vpcName,
  targetTags: [deployment.name], 
  sourceRanges: ['0.0.0.0/0'], // TODO: replace/tighten? removed/edited to enable ssh. needs to be the ip of the gateway or something similar
});

export const id = ipAddress.address;
