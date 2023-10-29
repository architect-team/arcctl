import * as kubernetes from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();

const provider = new kubernetes.Provider("provider", {
  kubeconfig: config.require("kubeconfig"),
});

const name = config.require('name').replace(/\//g, '-');

export const labels = (config.getObject('labels') || {}) as Record<string, string>;
labels['app'] = name;

const deployment = new kubernetes.apps.v1.Deployment("deployment", {
  metadata: {
    name,
    namespace: config.require('namespace'),
    labels,
  },
  spec: {
    replicas: config.getNumber('replicas') || 1,
    selector: {
      matchLabels: labels,
    },
    template: {
      metadata: {
        labels,
      },
      spec: {
        containers: [{
          name: 'main',
          image: config.require('image'),
          command: config.getObject('command') || [],
          env: Object
            .entries(config.getObject('environment') || {})
            .map(([name, value]) => ({ name, value }) as { name: string; value: string; }),
        }],
      },
    },
  }
}, {
  provider
});

export const id = deployment.id;
export const url = name;
