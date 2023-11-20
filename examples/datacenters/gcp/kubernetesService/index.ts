import * as kubernetes from "@pulumi/kubernetes";
import * as pulumi from '@pulumi/pulumi';

const config = new pulumi.Config('kubernetesService');

const kubernetesProvider = new kubernetes.Provider('provider', {
  kubeconfig: config.require('kubeconfig'),
});
const appName = config.require('name');
const servicePort = parseInt(config.require('port'));
const service = new kubernetes.core.v1.Service(appName, {
  metadata: {
    name: `service-${appName}`.replace(/\//g, '-'),
    namespace: config.get('namespace'), 
    annotations: {
      'pulumi.com/skipAwait': 'true'
    }
  },
  spec: {
    selector: {
      app: appName.replace(/\//g, '-')
    },
    ports: [{
      port: servicePort,
      protocol: 'TCP', // TODO: un-hardcode
      targetPort: servicePort
    }]
  }
}, {
  provider: kubernetesProvider
});

export const id = service.id;
export const protocol = config.get('protocol') ?? 'http';
export const host = appName;
export const port = servicePort;
export const url = `${protocol}://${host}${port}`; // TODO: update for exposed service
