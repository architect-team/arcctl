import * as docker from "@pulumi/docker";
import * as pulumi from "@pulumi/pulumi";

let config = new pulumi.Config();

const network = new docker.Network('network', {
  name: config.get('name'),
});

export const name = network.name.apply(name => name.toString());
