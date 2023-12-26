import * as kubernetes from "@pulumi/kubernetes";

const inputs = process.env.INPUTS;
if (!inputs) {
  throw new Error('Missing configuration. Please provide it via the INPUTS environment variable.');
}

type Config = {
  name: string;
  namespace?: string;
  kubeconfig: string;
  port: string;
  deployment: string;
  protocol?: string;
};

const config: Config = JSON.parse(inputs);

const kubernetesProvider = new kubernetes.Provider('provider', {
  kubeconfig: config.kubeconfig,
});
const name = config.name.replace(/\//g, '-');
const servicePort = parseInt(config.port);
const service = new kubernetes.core.v1.Service(name, {
  metadata: {
    name,
    namespace: config.namespace,
    annotations: {
      'pulumi.com/skipAwait': 'true'
    }
  },
  spec: {
    selector: {
      'architect.io/app': config.deployment.replace(/\//g, '--'),
    },
    ports: [{
      port: servicePort,
      targetPort: servicePort
    }]
  }
}, {
  provider: kubernetesProvider
});

export const id = service.id;
export const protocol = config.protocol ?? 'http';
export const host = name;
export const port = servicePort;
export const target_port = servicePort;
