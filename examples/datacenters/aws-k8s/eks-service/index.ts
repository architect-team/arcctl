import * as kubernetes from "@pulumi/kubernetes";

const inputs = process.env.INPUTS;
if (!inputs) {
  throw new Error('Missing configuration. Please provide it via the INPUTS environment variable.');
}

type Config = {
  name: string;
  namespace: string;
  kubeconfig: string;
  external_name?: string;
  port: number;
  labels?: Record<string, string>;
  deployment: string;
}

const config: Config = JSON.parse(inputs);

const provider = new kubernetes.Provider("provider", {
  kubeconfig: config.kubeconfig,
});
const name = config.name.replace(/\//g, '-');

const external_name = config.external_name;
const targetPort = config.port;
const service = new kubernetes.core.v1.Service('service', {
  metadata: {
    name,
    namespace: config.namespace,
    labels: config.labels,
    annotations: {
      "pulumi.com/skipAwait": "true"
    },
  },
  spec: external_name ? {
    type: 'ExternalName',
    externalName: external_name,
  } : {
    type: 'NodePort',
    selector: {
      'architect.io/app': config.deployment.replace(/\//g, '--'),
    },
    ports: [
      {
        port: 80,
        targetPort: targetPort,
      }
    ]
  }
}, { provider });

export const id = service.id.apply(id => id.toString());
export const host = name;
export const port = 80;
export const target_port = targetPort;