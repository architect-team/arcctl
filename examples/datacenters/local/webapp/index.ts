import * as docker from "@pulumi/docker";
import * as pulumi from "@pulumi/pulumi";
import { ContainerLabel, ContainerPort } from "@pulumi/docker/types/input";

let config = new pulumi.Config();

const volume = new docker.Volume('volume');

const build_command = config.getObject<string[]>('build');
let build_task: docker.Container | undefined;
if (build_command) {
  build_task = new docker.Container("build", {
    image: config.require('image'),
    command: build_command,
    volumes: [{
      volumeName: volume.name,
      containerPath: config.require('outdir'),
    }],
  });
}

const service_name = config.require('service_name');
const labels: ContainerLabel[] = [{
  label: 'traefik.enable',
  value: 'true',
}, {
  label: `traefik.http.routers.${service_name}.rule`,
  value: `Host(\`${config.require('hostname')}\`)`,
}, {
  label: `traefik.http.routers.${service_name}.service`,
  value: service_name,
}, {
  label: `traefik.http.services.${service_name}.loadbalancer.server.port`,
  value: '80',
}];
const webapp_server = new docker.Container("webapp", {
  name: config.require('service_name'),
  labels,
  image: config.getObject('start') ? config.require('image') : 'nginx:latest',
  command: config.getObject('start') || undefined,
  volumes: [{
    volumeName: volume.name,
    containerPath: config.getObject('start') ? './' : '/usr/share/nginx/html',
  }],
}, build_task ? {
  dependsOn: [build_task],
} : undefined);

export const id = webapp_server.id.apply(id => id.toString());
export const name = webapp_server.name.apply(name => name.toString());
