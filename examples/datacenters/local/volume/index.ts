import * as docker from "@pulumi/docker";

const inputs = process.env.INPUTS;
if (!inputs) {
  throw new Error('Missing configuration. Please provide it via the INPUTS environment variable.');
}

type Config = {
  name: string;
}

const config: Config = JSON.parse(inputs);

const volume = new docker.Volume("volume", {
  name: config.name
})

export const id = volume.id.apply(id => id.toString());
