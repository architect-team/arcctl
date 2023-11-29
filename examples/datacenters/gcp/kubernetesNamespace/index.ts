import * as kubernetes from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';

const config = new pulumi.Config('kubernetesNamespace');
const kubernetesProvider = new kubernetes.Provider('provider', {
  kubeconfig: config.require('kubeconfig'),
});

const namespace = new kubernetes.core.v1.Namespace(config.name, {
  metadata: {
    name: config.require('name')
  } 
}, {
  provider: kubernetesProvider
});

export const id = namespace.id;
export const name = namespace.metadata.name;
