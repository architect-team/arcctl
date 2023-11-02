import * as kubernetes from "@pulumi/kubernetes";
import * as pulumi from '@pulumi/pulumi';

const config = new pulumi.Config('kubernetesService');

const kubernetesProvider = new kubernetes.Provider('provider', {
  kubeconfig: config.require('kubeconfig'),
});
const appName = config.require('name');
const service = new kubernetes.core.v1.Service(appName, {
  metadata: {
    name: appName,
    namespace: config.get('namespace')
  },
  spec: {
    selector: {
      app: appName
    },
    ports: [{
      port: parseInt(config.require('port')),
      protocol: config.require('protocol'),
      targetPort: parseInt(config.require('port'))
    }]
  }
}, {
  provider: kubernetesProvider
});
