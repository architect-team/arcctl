import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

interface Volume {
  volume: string;
  mount_path: string;
  image?: string | undefined;
  readonly: boolean;
};

const config = new pulumi.Config('serverlessDeployment');
const gcpConfig = new pulumi.Config('gcp');

const _cloudRunService = new gcp.projects.Service('cloud-run-service', {
  service: 'run.googleapis.com',
  disableOnDestroy: false,
});

const _iamService = new gcp.projects.Service('iam-service', {
  service: 'iam.googleapis.com',
  disableOnDestroy: false,
});

let labelsObject;
try {
  const labels = config.get('labels');
  if (labels) {
    labelsObject = JSON.parse(labels);
  }
} catch (err) {
  throw new Error('Could not parse labels config object');
}

// "Zone" is the more specific part of a region
// e.g. "us-central1-a" is the Zone and "us-central1" is the Region.
// The Zone is passed in as the "labels.region" input
let region;
let zone;
if (labelsObject?.region) {
  zone = labelsObject.region;
  region = zone.split('-').slice(0, -1).join('-');
}

const vpcName = labelsObject?.vpc;
const namespace = (config.get('namespace') || 'ns').substring(0, 20);
const name = config.require('name').replace(/\//g, '-');

let firstDeployment;
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

let labelsOutput: Record<string, string | pulumi.Output<string>> = {};

const deploymentName = `${namespace}-${name.slice(-20)}`;

let servicesObject;
try {
  servicesObject = JSON.parse(config.require('services'));
} catch(err) {
  throw new Error('Error parsing services to JSON. At least one service must be specified');
}

for (const service of servicesObject) {
  const servicePort = Number(service.port || 80);
  const resourceName = `${deploymentName}-${servicePort}`;

  let volumeMountsObject;
  try {
    const volumeMounts = config.get('volume_mounts');
    if (volumeMounts) {
      volumeMountsObject = JSON.parse(config.require('volume_mounts'));
    }
  } catch (err) {
    throw new Error('Error parsing volume mounts to object');
  }

  const deploymentNameLabel = `${resourceName}-deployment`;
  const deployment = new gcp.cloudrunv2.Service(deploymentName, {
    name: resourceName,
    location: region,
    ingress: 'INGRESS_TRAFFIC_ALL',
    template: {
      vpcAccess: {
        connector: `projects/${gcpConfig.require('project')}/locations/${region}/connectors/${
          vpcName.substring(0, 15)
        }-connector`,
        egress: 'PRIVATE_RANGES_ONLY',
      },
      containers: [{
        image: config.require('image'),
        args: typeof entrypoint === 'string' ? entrypoint.split(' ') : entrypoint,
        commands: typeof command === 'string' ? command.split(' ') : command,
        envs: env,
        ports: [{ containerPort: servicePort }],
        resources: {
          limits: {
            ...(config.get('cpu') ? { cpu: config.require('cpu') } : {}),
            ...(config.get('memory') ? { memory: config.require('memory') } : {}),
          }
        },
        volumeMounts: (volumeMountsObject || []).map((volume: Volume) => {
          return {
            name: volume.volume,
            mountPath: volume.mount_path,
          };
        }),
      }]
    }
  }, {
    dependsOn: [_cloudRunService, _iamService]
  });

  const cloudRunServiceIamBinding = new gcp.cloudrunv2.ServiceIamBinding(`${resourceName}-service-binding`, {
    project: deployment.project,
    location: region,
    name: resourceName,
    role: 'roles/run.invoker',
    members: [
      'allUsers',
    ],
  });

  labelsOutput[deploymentNameLabel] = pulumi.interpolate`${deployment.uri}`;
  if (!firstDeployment) {
    firstDeployment = deployment;
  }
}

export const id = firstDeployment?.id;
export const labels = labelsOutput;
