import * as docker from "@pulumi/docker";
import * as pulumi from "@pulumi/pulumi";

let config = new pulumi.Config();

const deployment = new docker.Container("deployment", {
  name: config.get('name'),
  image: config.require('image'),
  command: config.getObject('command'),
  volumes: config.getObject('volume_mounts'),
  ports: config.getObject('exposed_ports'),
});

export const id = deployment.id.apply(id => id.toString());
