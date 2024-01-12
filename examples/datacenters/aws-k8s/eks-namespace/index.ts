import * as kubernetes from "@pulumi/kubernetes";

const inputs = process.env.INPUTS;
if (!inputs) {
  throw new Error('Missing configuration. Please provide it via the INPUTS environment variable.');
}

type Config = {
  name: string;
  kubeconfig: string;
}

const config: Config = JSON.parse(inputs);

const provider = new kubernetes.Provider("provider", {
  kubeconfig: config.kubeconfig,
});

new kubernetes.core.v1.Namespace("namespace", {
  metadata: {
    name: config.name,
  },
}, {
  provider
});

export const id = config.name;
