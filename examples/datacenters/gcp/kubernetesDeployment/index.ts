import * as kubernetes from '@pulumi/kubernetes';

const inputs = process.env.INPUTS;
if (!inputs) {
  throw new Error('Missing configuration. Please provide it via the INPUTS environment variable.');
}

type Config = {
  name: string;
  image: string;
  command?: string | string[];
  entrypoint?: string | string[];
  namespace?: string;
  replicas?: string | number;
  kubeconfig: string;
  cpu?: number;
  memory?: string;
  labels?: Record<string, string>;
  environment?: Record<string, string>;
};

const config: Config = JSON.parse(inputs);

const kubernetesProvider = new kubernetes.Provider('provider', {
  kubeconfig: config.kubeconfig,
});

const name = config.name.replace(/\//g, '-');
const cpu = config.cpu;
const memory = config.memory;

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
    labels: _labels
  },
  spec: {
    replicas: config.replicas ? Number(config.replicas) : 1,
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
          command: config.command && typeof config.command === 'string' ? [config.command] : config.command,
          env: Object
            .entries(config.environment || {})
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