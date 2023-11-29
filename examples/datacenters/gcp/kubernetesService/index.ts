import * as kubernetes from "@pulumi/kubernetes";
import * as pulumi from '@pulumi/pulumi';

const config = new pulumi.Config('kubernetesService');

const kubernetesProvider = new kubernetes.Provider('provider', {
  kubeconfig: config.require('kubeconfig'),
});
const name = config.require('name').replace(/\//g, '-');
const servicePort = parseInt(config.require('port'));
const service = new kubernetes.core.v1.Service(name, {
  metadata: {
    name,
    namespace: config.get('namespace'),
    annotations: {
      'pulumi.com/skipAwait': 'true'
    }
  },
  spec: {
    selector: {
      'architect.io/app': config.require('deployment').replace(/\//g, '--'),
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
export const protocol = config.get('protocol') ?? 'http';
export const host = name;
export const port = servicePort;
export const target_port = servicePort;
