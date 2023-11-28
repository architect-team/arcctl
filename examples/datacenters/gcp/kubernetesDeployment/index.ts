import * as kubernetes from '@pulumi/kubernetes';
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config('kubernetesDeployment');

const kubernetesProvider = new kubernetes.Provider('provider', {
  kubeconfig: config.require('kubeconfig'),
});

const name = config.require('name').replace(/\//g, '-');
const cpu = config.getNumber('cpu');
const memory = config.get('memory');

const matchLabels = {
  'architect.io/app': name,
};
let _labels = (config.getObject('labels') || {}) as Record<string, string>;
_labels = {
  ..._labels,
  ...matchLabels,
}


const deployment = new kubernetes.apps.v1.Deployment("deployment", {
  metadata: {
    name,
    namespace: config.get('namespace'),
    labels: _labels
  },
  spec: {
    replicas: config.get('replicas') ? parseInt(config.require('replicas')) : 1,
    selector: {
      matchLabels: matchLabels,
    },
    template: {
      metadata: {
        namespace: config.require('namespace'),
        labels: matchLabels
      },
      spec: {
        containers: [{
          name: 'main',
          image: config.require('image'),
          command: config.getObject('command') || [],
          env: Object
            .entries(config.getObject('environment') || {})
            .map(([name, value]) => ({ name, value }) as { name: string; value: string; }),
          resources: {
            requests: {
              ...(cpu ? { cpu: String(cpu) } : {}),
              ...(memory ? { memory } : {}),
            },
            limits: {
              ...(cpu ? { cpu: String(cpu) } : {}),
              ...(memory ? { memory } : {}),
            },
          },
        }],
      },
    },
  },
}, {
  provider: kubernetesProvider
});

export const id = deployment.id.apply(id => id.toString());