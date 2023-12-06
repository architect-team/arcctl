import * as docker from "@pulumi/docker";
import { ContainerLabel, ContainerPort } from "@pulumi/docker/types/input";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();
export const name = config.require('name');

type Config = {
  name: string;
  image: string;
  command?: string[];
  entrypoint?: string[];
  labels?: Record<string, string>;
  services?: {
    name: string;
    host: string;
    port: number;
    target_port: number;
    protocol: string;
  }[];
  ingresses?: {
    service: string;
    host: string;
    port: string;
    protocol: string;
    path?: string;
    subdomain: string;
    dns_zone: string;
  }[];
  ports?: {
    internal: number;
    external?: number;
  }[];
  environment?: Record<string, string>;
  volume_mounts?: {
    host_path: string;
    mount_path: string;
  }[];
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

const inputServices = config.getObject<Config['services']>('services') || [];
for (const key in inputServices) {
  const value = inputServices[key];
  if (!labels.find(label => label.label === 'traefik.enable')) {
    labels.push({
      label: 'traefik.enable',
      value: 'true',
    });
  }

  if (value.protocol === 'http') {
    labels.push({
      label: `traefik.http.routers.${value.name}-svc.rule`,
      value: `Host(\`${value.host}\`)`,
    }, {
      label: `traefik.http.routers.${value.name}-svc.service`,
      value: value.name,
    }, {
      label: `traefik.http.services.${value.name}.loadbalancer.server.port`,
      value: value.target_port.toString(),
    });
  } else {
    labels.push({
      label: `traefik.tcp.routers.${value.name}-svc.rule`,
      value: `HostSNI(\`${value.host}\`)`
    }, {
      label: `traefik.tcp.routers.${value.name}-svc.service`,
      value: value.name,
    }, {
      label: `traefik.tcp.routers.${value.name}-svc.tls.passthrough`,
      value: 'true',
    }, {
      label: `traefik.tcp.services.${value.name}.loadbalancer.server.port`,
      value: value.target_port.toString(),
    })
  }
}

const inputIngresses = config.getObject<Config['ingresses']>('ingresses') || [];
for (const key in inputIngresses) {
  const value = inputIngresses[key];
  const routerKey = value.subdomain.replace(/\./g, '-').replace(/\*/g, 'star');
  if (value.protocol === 'http') {
    labels.push({
      label: `traefik.http.routers.${routerKey}.rule`,
      value: value.host.includes('*')
        ? `HostRegexp(\`${value.host.replace('*', '{subdomain:[a-z_-]+}')}\`) && PathPrefix(\`${value.path || '/'}\`)`
        : `Host(\`${value.host}\`) && PathPrefix(\`${value.path || '/'}\`)`,
    }, {
      label: `traefik.http.routers.${routerKey}.service`,
      value: value.service,
    });
  } else {
    labels.push({
      label: `traefik.tcp.routers.${routerKey}.rule`,
      value: `HostSNI(\`${value.host}\`)`
    }, {
      label: `traefik.tcp.routers.${routerKey}.service`,
      value: value.service,
    }, {
      label: `traefik.tcp.routers.${routerKey}.tls.passthrough`,
      value: 'true',
    });
  }
}

const envs = Object.entries(config.getObject<Config['environment']>('environment') || {}).map(([key, value]) => (`${key}=${value}`));
const volumes = config.getObject<Config['volume_mounts']>('volume_mounts') || [];

const deployment = new docker.Container("deployment", {
  name,
  image: config.require('image'),
  command: config.getObject('command'),
  entrypoints: config.getObject('entrypoint'),
  envs,
  labels,
  ports,
  volumes: volumes.map(volume => ({
    hostPath: volume.host_path,
    containerPath: volume.mount_path,
  })),
});

export const id = deployment.id.apply(id => id.toString());