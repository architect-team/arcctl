import * as docker from "@pulumi/docker";

const inputs = process.env.INPUTS;
if (!inputs) {
  throw new Error('Missing configuration. Please provide it via the INPUTS environment variable.');
}

type Config = {
  name: string;
  hostPath?: string;
}

const config: Config = JSON.parse(inputs);

console.log('Config', config);

const volume = new docker.Volume("volume", {
  name: config.name,
  ...(config.hostPath ? {
    driver: 'local',
    driverOpts: {
      o: 'bind',
      type: 'none',
      device: config.hostPath,
    }
  } : {}),
  
})

export const id = volume.id.apply(id => id.toString());
