import * as kubernetes from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

let config = new pulumi.Config();
const name = config.get('name')!.replace(/\//g, '-').replace(/_/g, '-');
const configData = config.get('data')!;
const namespace = config.get('namespace')!;

const provider = new kubernetes.Provider("provider", {
  kubeconfig: config.require("kubeconfig"),
});

const secret = new kubernetes.core.v1.Secret(name, {
  metadata: {
    name: name,
    namespace: namespace,
  },
  data: {
    "data": Buffer.from(configData).toString('base64'),
  },
}, {
  provider,
});

export const id = secret.id;
export const data = configData;
