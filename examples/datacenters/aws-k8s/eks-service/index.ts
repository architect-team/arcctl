import * as kubernetes from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();

const provider = new kubernetes.Provider("provider", {
  kubeconfig: config.require("kubeconfig"),
});
const name = config.require('name').replace(/\//g, '-');

const external_name = config.get('external_name');
const service = new kubernetes.core.v1.Service('service', {
  metadata: {
    name,
    namespace: config.require('namespace'),
    labels: config.getObject<Record<string, string>>('labels'),
    annotations: {
      "pulumi.com/skipAwait": "true"
    },
  },
  spec: external_name ? {
    type: 'ExternalName',
    externalName: external_name,
  } : {
    type: 'ClusterIP',
    selector: {
      'architect.io/app': config.require('deployment').replace(/\//g, '--'),
    },
    ports: [
      {
        port: 80,
        targetPort: config.requireNumber('port'),
      }
    ]
  }
}, { provider });

export const id = service.id.apply(id => id.toString());
export const host = name;
export const port = 80;