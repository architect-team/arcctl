import * as gcp from "@pulumi/gcp";
import * as yaml from 'js-yaml';

const inputs = process.env.INPUTS;
if (!inputs) {
  throw new Error('Missing configuration. Please provide it via the INPUTS environment variable.');
}

type Config = {
  name: string;
  image: string;
  labels?: Record<string, string>;
  namespace: string;
  entrypoint?: string | string[];
  command?: string | string[];
  environment?: Record<string, string>;
};

const config: Config = JSON.parse(inputs);

const vpcName = config.labels?.vpc;
const namespace = config.namespace.substring(0, 20);
const name = config.name.replace(/\//g, '-');

const env = Object.entries(config.environment ?? {}).map(([key, value]) => ({
  name: key,
  value: String(value),
}));

const deploymentName = `${namespace}-${name.slice(-40)}`;

const container = {
  spec: {
    containers: [{
      image: config.image,
      args: typeof config.entrypoint === 'string' ? config.entrypoint.split(' ') : config.entrypoint,
      command: typeof config.command === 'string' ? config.command.split(' ') : config.command,
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

const zone = config.labels?.zone;
const deployment = new gcp.compute.Instance('gce-deployment', {
  name: deploymentName,
  zone,
  tags: [deploymentName],
  machineType: 'e2-micro',
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

const instanceGroup = new gcp.compute.InstanceGroup('gce-deployment-instance-group',  {
  name: deploymentName,
  instances: [deployment.selfLink],
  zone,
  namedPorts: [{
    name: 'http',
    port: 3000
  }]
});

export const id = instanceGroup.selfLink; 
export const labels = config.labels ?? {};
