import * as docker from "@pulumi/docker";
import { ContainerLabel, ContainerPort } from "@pulumi/docker/types/input";
import * as pulumi from "@pulumi/pulumi";

let config = new pulumi.Config();

type Config = {
  name?: string;
  image: string;
  command?: string[];
  labels?: Record<string, string>;
  services?: Record<string, {
    hostname: string;
    port: number;
    protocol: string;
  }>;
  ports?: {
    internal: number;
    external?: number;
  }[];
  environment?: Record<string, string>;
};

const labels: ContainerLabel[] = [];
const ports: ContainerPort[] = config.getObject<Config['ports']>('ports') || [];

const inputLabels = config.getObject<Config['labels']>('labels') || {};
for (const [key, value] of Object.entries(inputLabels)) {
  labels.push({
    label: key,
    value,
  });
}

const inputServices = config.getObject<Config['services']>('services') || {};
for (const [key, value] of Object.entries(inputServices)) {
  if (value.protocol === 'http') {
    labels.push({
      label: `traefik.http.routers.${key}.rule`,
      value: `Host(\\\`${value.hostname}.127.0.0.1.nip.io\\\`)`,
    }, {
      label: `traefik.http.services.${key}.loadbalancer.server.port`,
      value: value.port.toString(),
    });
  } else {
    labels.push({
      label: `traefik.tcp.routers.${key}.rule`,
      value: `HostSNI(\\\`${value.hostname}.127.0.0.1.nip.io\\\`)`
    }, {
      label: `traefik.tcp.routers.${key}.tls`,
      value: 'true',
    }, {
      label: `traefik.tcp.services.${key}.loadbalancer.server.port`,
      value: value.port.toString(),
    })
  }
}

const envs = Object.entries(config.getObject<Config['environment']>('environment') || {}).map(([key, value]) => (`${key}=${value}`));

const deployment = new docker.Container("deployment", {
  name: config.get('name'),
  image: config.require('image'),
  command: config.getObject('command'),
  volumes: config.getObject('volumes'),
  envs,
  labels,
  ports,
});

export const id = deployment.id.apply(id => id.toString());
