import * as kubernetes from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();

const provider = new kubernetes.Provider("provider", {
  kubeconfig: config.require("kubeconfig"),
});
export const name = config.require('name').replace(/\//g, '-');
export const target_port = config.requireNumber('port');
export const exposePort = config.get('protocol') !== 'http' ? target_port : 80;

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
        port: exposePort,
        targetPort: config.requireNumber('port'),
      }
    ]
  }
}, { provider });

export const id = service.id.apply(id => id.toString());
export const protocol = config.get('protocol') ?? 'http';
export const host = name;
export const port = exposePort;
export const url = `${protocol}://${host}${exposePort === 80 ? '' : ':' + exposePort}`;