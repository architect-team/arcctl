import * as kubernetes from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();

const provider = new kubernetes.Provider("provider", {
  kubeconfig: config.require("kubeconfig"),
});

const name = config.require('name').replace(/\//g, '-');

export const labels = {
  "name": name,
};
const service = new kubernetes.core.v1.Service('service', {
  metadata: {
    name: name,
    namespace: config.require('namespace'),
    labels: labels as any,
    annotations: {
      "pulumi.com/skipAwait": "true"
    },
  },
  spec: {
    selector: {
      app: config.require('target_deployment').replace(/\//g, '-'),
    },
    ports: [{
      port: config.requireNumber('target_port'),
    }]
  }
}, {
  provider
});

export const id = service.id;
export const url = name;
export const host = name;
export const port = config.requireNumber('target_port');
