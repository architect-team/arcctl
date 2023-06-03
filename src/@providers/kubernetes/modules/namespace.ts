import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule } from '../../module.ts';
import { Namespace } from '../.gen/providers/kubernetes/namespace/index.ts';
import { KubernetesCredentials } from '../credentials.ts';
import { Construct } from 'constructs';

export class KubernetesNamespaceModule extends ResourceModule<
  'namespace',
  KubernetesCredentials
> {
  private namespace: Namespace;
  outputs: ResourceOutputs['namespace'];

  constructor(
    scope: Construct,
    id: string,
    inputs: ResourceInputs['namespace'],
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

  genImports(
    _credentials: KubernetesCredentials,
    resourceId: string,
  ): Promise<Record<string, string>> {
    return Promise.resolve({
      [this.getResourceRef(this.namespace)]: resourceId,
    });
  }

  getDisplayNames(): Record<string, string> {
    return {
      [this.getResourceRef(this.namespace)]: 'Kubernetes Namespace',
    };
  }
}
