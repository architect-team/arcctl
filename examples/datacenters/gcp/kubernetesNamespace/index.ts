import * as kubernetes from '@pulumi/kubernetes';

const inputs = process.env.INPUTS;
if (!inputs) {
  throw new Error('Missing configuration. Please provide it via the INPUTS environment variable.');
}

type Config = {
  name: string;
  kubeconfig: string;
};

const config: Config = JSON.parse(inputs);

const kubernetesProvider = new kubernetes.Provider('provider', {
  kubeconfig: config.kubeconfig,
});

const namespace = new kubernetes.core.v1.Namespace(config.name, {
  metadata: {
    name: config.name
  } 
}, {
  provider: kubernetesProvider
});

export const id = namespace.id;
export const name = namespace.metadata.name;
