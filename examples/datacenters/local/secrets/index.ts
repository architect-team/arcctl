import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

let config = new pulumi.Config();
const name = config.get('name')!;
const data = config.get('data')!;
const namespace = config.get('namespace')!;

const secret = new k8s.core.v1.Secret(name, {
  metadata: {
    name: name,
    namespace: namespace,
  },
  data: {
    "data": data,
  },
});

export const id = secret.id.apply(id => id.toString());
