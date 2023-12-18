import * as docker from "@pulumi/docker";
import { ContainerLabel, ContainerPort } from "@pulumi/docker/types/input";

const inputs = process.env.INPUTS;
if (!inputs) {
  throw new Error('Missing configuration. Please provide it via the INPUTS environment variable.');
}

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

const config: Config = JSON.parse(inputs);

const labels: ContainerLabel[] = [];
const ports: ContainerPort[] = (config.ports ?? []).map(item => ({
  internal: parseInt(item.internal.toString()),
  external: parseInt(item.external?.toString() || item.internal.toString()),
}));

const inputLabels = config.labels ?? {};
for (const [key, value] of Object.entries(inputLabels)) {
  labels.push({
    label: key,
    value,
  });
}

const inputServices = config.services ?? [];
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

const inputIngresses = config.ingresses ?? [];
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

const envs = Object.entries(config.environment ?? {}).map(([key, value]) => (`${key}=${value}`));
const volumes = config.volume_mounts ?? [];

const deployment = new docker.Container("deployment", {
  name: config.name,
  image: config.image,
  command: config.command,
  entrypoints: config.entrypoint,
  envs,
  labels,
  ports,
  volumes: volumes.map(volume => ({
    hostPath: volume.host_path.replace(/^"(.*)"$/, '$1'),
    containerPath: volume.mount_path.replace(/^"(.*)"$/, '$1'),
  })),
});

export const id = deployment.id.apply(id => id.toString());
export const name = config.name;