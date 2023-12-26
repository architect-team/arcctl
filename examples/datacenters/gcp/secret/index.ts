import * as kubernetes from "@pulumi/kubernetes";

const inputs = process.env.INPUTS;
if (!inputs) {
  throw new Error('Missing configuration. Please provide it via the INPUTS environment variable.');
}

type Config = {
  name: string;
  namespace?: string;
  kubeconfig: string;
  data: string;
};

const config: Config = JSON.parse(inputs);

const name = config.name.replace(/\//g, '-').replace(/_/g, '-');
const configData = config.data;

const provider = new kubernetes.Provider("provider", {
  kubeconfig: config.kubeconfig,
});

const secret = new kubernetes.core.v1.Secret(name, {
  metadata: {
    name,
    namespace: config.namespace,
  },
  data: {
    "data": Buffer.from(configData).toString('base64'),
  },
}, {
  provider,
});

export const id = secret.id;
export const data = configData;
