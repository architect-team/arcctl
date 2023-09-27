import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

let config = new pulumi.Config();
const name = config.get('name')!;
const configData = config.get('data')!;
const namespace = config.get('namespace')!;

const secret = new k8s.core.v1.Secret(name, {
  metadata: {
    name: name,
    namespace: namespace,
  },
  data: {
    "data": configData,
  },
});

export const id = secret.id;
export const data = configData;
