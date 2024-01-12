import * as kubernetes from "@pulumi/kubernetes";

const inputs = process.env.INPUTS;
if (!inputs) {
  throw new Error('Missing configuration. Please provide it via the INPUTS environment variable.');
}

type Config = {
  name: string;
  namespace: string;
  image: string;
  kubeconfig: string;
  labels?: Record<string, string>;
  cpu?: number;
  memory?: string;
  replicas?: number;
  command?: string[];
  environment?: Record<string, string>;
}

const config: Config = JSON.parse(inputs);

const provider = new kubernetes.Provider("provider", {
  kubeconfig: config.kubeconfig,
});

const name = config.name.replace(/\//g, '-');

const matchLabels = {
  'architect.io/app': name,
};

let _labels = (config.labels || {}) as Record<string, string>;
_labels = {
  ..._labels,
  ...matchLabels,
}

const deployment = new kubernetes.apps.v1.Deployment("deployment", {
  metadata: {
    name,
    namespace: config.namespace,
    labels: _labels,
  },
  spec: {
    replicas: config.replicas ?? 1,
    selector: {
      matchLabels: matchLabels,
    },
    template: {
      metadata: {
        namespace: config.namespace,
        labels: matchLabels
      },
      spec: {
        containers: [{
          name: 'main',
          image: config.image,
          command: config.command ?? [],
          env: Object
            .entries(config.environment || {})
            .map(([name, value]) => ({ name, value }) as { name: string; value: string; }),
          resources: {
            requests: {
              ...(config.cpu ? { cpu: String(config.cpu) } : {}),
              ...(config.memory ? { memory: config.memory } : {}),
            },
            limits: {
              ...(config.cpu ? { cpu: String(config.cpu) } : {}),
              ...(config.memory ? { memory: config.memory } : {}),
            },
          },
        }],
      },
    },
  }
}, {
  provider
});

export const id = deployment.id.apply(id => id.toString());
