import * as kubernetes from '@pulumi/kubernetes';
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config('kubernetesDeployment');

const kubernetesProvider = new kubernetes.Provider('provider', {
  kubeconfig: config.require('kubeconfig'),
});
const appName = config.require('name');
const deployment = new kubernetes.apps.v1.Deployment("deployment", {
  metadata: {
    labels: {
      app: appName,
    },
    name: `${appName}-deployment`,
    namespace: config.get('namespace'),
  },
  spec: {
    replicas: config.get('replicas') ? parseInt(config.require('replicas')) : 1,
    selector: {
      matchLabels: {
        app: appName,
      },
    },
    template: {
      metadata: {
        labels: {
          app: appName,
        },
      },
      spec: {
        containers: [{
          image: config.require('image'),
          name: appName,
          ports: [{
            containerPort: parseInt(config.require('port')),
          }],
        }],
      },
    },
  },
}, {
  provider: kubernetesProvider
});
