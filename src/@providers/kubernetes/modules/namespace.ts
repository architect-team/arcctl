import { ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule, ResourceModuleOptions } from '../../module.ts';
import { Namespace } from '../.gen/providers/kubernetes/namespace/index.ts';
import { KubernetesCredentials } from '../credentials.ts';
import { Construct } from 'constructs';

export class KubernetesNamespaceModule extends ResourceModule<'namespace', KubernetesCredentials> {
  private namespace: Namespace;
  outputs: ResourceOutputs['namespace'];

  constructor(scope: Construct, options: ResourceModuleOptions<'namespace'>) {
    super(scope, options);

    this.namespace = new Namespace(scope, 'namespace', {
      metadata: {
        name: this.inputs?.name || 'unknown',
      },
    });

    this.outputs = {
      id: this.namespace.metadata.name,
    };
  }

  genImports(_credentials: KubernetesCredentials, resourceId: string): Promise<Record<string, string>> {
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
