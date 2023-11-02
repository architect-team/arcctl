import * as kubernetes from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();

const name = config.require("name");
const provider = new kubernetes.Provider("provider", {
  kubeconfig: config.require("kubeconfig"),
});

const namespace = new kubernetes.core.v1.Namespace("namespace", {
  metadata: {
    name,
  },
}, {
  provider
});

export const id = namespace.id;
