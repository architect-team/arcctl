import * as docker from "@pulumi/docker";

const inputs = process.env.INPUTS;
if (!inputs) {
  throw new Error('Missing configuration. Please provide it via the INPUTS environment variable.');
}

type Config = {
  name?: string;
}

const config: Config = JSON.parse(inputs);

const network = new docker.Network('network', {
  name: config.name,
});

export const name = network.name.apply(name => name.toString());
