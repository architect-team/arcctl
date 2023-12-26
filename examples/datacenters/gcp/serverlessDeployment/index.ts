import * as gcp from "@pulumi/gcp";
import * as pulumi from "@pulumi/pulumi";

const inputs = process.env.INPUTS;
if (!inputs) {
  throw new Error('Missing configuration. Please provide it via the INPUTS environment variable.');
}

type Config = {
  labels: Record<string, string>;
  namespace: string;
  image: string;
  name: string;
  entrypoint?: string | string[];
  command?: string | string[];
  environment?: Record<string, string>;
  cpu?: string;
  memory?: string;
  volume_mounts?: {
    volume: string;
    mount_path: string;
    image?: string | undefined;
    readonly: boolean;
  }[];
  services: {
    port: string;
  }[];
};

const config: Config = JSON.parse(inputs);

const gcpConfig = new pulumi.Config('gcp');

const _cloudRunService = new gcp.projects.Service('cloud-run-service', {
  service: 'run.googleapis.com',
  disableOnDestroy: false,
});

const _iamService = new gcp.projects.Service('iam-service', {
  service: 'iam.googleapis.com',
  disableOnDestroy: false,
});

// "Zone" is the more specific part of a region
// e.g. "us-central1-a" is the Zone and "us-central1" is the Region.
// The Zone is passed in as the "labels.region" input
let region;
let zone;
if (config.labels.region) {
  zone = config.labels.region;
  region = zone.split('-').slice(0, -1).join('-');
}

if (!config.labels.vpc) {
  throw new Error('Missing required label: vpc');
}

const vpcName = config.labels.vpc;
const namespace = config.namespace.substring(0, 20);
const name = config.name.replace(/\//g, '-');

let firstDeployment;
const env = Object.entries(config.environment || {}).map(([key, value]) => ({
  name: key,
  value: String(value),
}));

let labelsOutput: Record<string, string | pulumi.Output<string>> = {};

const deploymentName = `${namespace}-${name.slice(-20)}`;

for (const service of config.services) {
  const servicePort = Number(service.port || 80);
  const resourceName = `${deploymentName}-${servicePort}`;

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
        image: config.image,
        args: typeof config.entrypoint === 'string' ? config.entrypoint.split(' ') : config.entrypoint,
        commands: typeof config.command === 'string' ? config.command.split(' ') : config.command,
        envs: env,
        ports: [{ containerPort: servicePort }],
        resources: {
          limits: {
            ...(config.cpu ? { cpu: config.cpu } : {}),
            ...(config.memory ? { memory: config.memory } : {}),
          }
        },
        volumeMounts: (config.volume_mounts || []).map((volume) => {
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

  new gcp.cloudrunv2.ServiceIamBinding(`${resourceName}-service-binding`, {
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
