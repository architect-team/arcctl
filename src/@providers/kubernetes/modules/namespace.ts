import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule } from '../../module.ts';
import { Namespace } from '../.gen/providers/kubernetes/namespace/index.ts';
import { KubernetesCredentials } from '../credentials.ts';
import { Construct } from 'npm:constructs';

export class KubernetesNamespaceModule extends ResourceModule<
  'kubernetesNamespace',
  KubernetesCredentials
> {
  private namespace: Namespace;
  outputs: ResourceOutputs['kubernetesNamespace'];

  constructor(
    scope: Construct,
    id: string,
    inputs: ResourceInputs['kubernetesNamespace'],
  ) {
    super(scope, id, inputs);

    this.namespace = new Namespace(scope, inputs.name, {
      metadata: {
        name: inputs.name,
      },
    });

    this.outputs = {
      id: this.namespace.metadata.name,
    };
  }

  async genImports(
    credentials: KubernetesCredentials,
    resourceId: string,
  ): Promise<Record<string, string>> {
    return {
      [this.getResourceRef(this.namespace)]: resourceId,
    };
  }

  getDisplayNames(): Record<string, string> {
    return {
      [this.getResourceRef(this.namespace)]: 'Kubernetes Namespace',
    };
  }
}
