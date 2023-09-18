import * as docker from "@pulumi/docker";
import * as pulumi from "@pulumi/pulumi";

let config = new pulumi.Config();

const volume = new docker.Volume("volume", {
  name: config.require('name')
})

export const id = volume.id.apply(id => id.toString());
