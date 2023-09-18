import * as kubernetes from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();

const provider = new kubernetes.Provider("provider", {
  kubeconfig: config.require("kubeconfig"),
});

export const labels = {
  ...(config.getObject('labels') || {}),
  "name": config.require('name'),
};
const service = new kubernetes.core.v1.Service('service', {
  metadata: {
    name: config.require('name'),
    namespace: config.require('namespace'),
    labels: labels as any,
  },
  spec: {
    selector: {
      app: config.require('target_deployment'),
    },
    ports: [{
      port: config.requireNumber('target_port'),
    }]
  }
}, {
  provider
});

export const id = service.id;
export const host = config.require('name');
export const port = config.requireNumber('target_port');
