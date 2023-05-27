import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.js';
import { ResourceModule } from '../../module.js';
import { Namespace } from '../.gen/providers/kubernetes/namespace/index.js';
import { KubernetesCredentials } from '../credentials.js';
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
