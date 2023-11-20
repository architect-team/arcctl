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
      app: appName.replace(/\//g, '-'),
    },
    name: `${appName}-deployment`,
    namespace: config.get('namespace'),
  },
  spec: {
    replicas: config.get('replicas') ? parseInt(config.require('replicas')) : 1,
    selector: {
      matchLabels: {
        app: appName.replace(/\//g, '-'),
      },
    },
    template: {
      metadata: {
        labels: {
          app: appName.replace(/\//g, '-'),
        },
      },
      spec: {
        containers: [{
          image: config.require('image'),
          name: appName.replace(/\//g, '-'),
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

export const id = deployment.id;
