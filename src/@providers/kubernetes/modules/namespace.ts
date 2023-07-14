import { Construct } from 'constructs';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule, ResourceModuleOptions } from '../../module.ts';
import { Namespace } from '../.gen/providers/kubernetes/namespace/index.ts';
import { KubernetesCredentials } from '../credentials.ts';

export class KubernetesNamespaceModule extends ResourceModule<'namespace', KubernetesCredentials> {
  private namespace: Namespace;
  outputs: ResourceOutputs['namespace'];

  constructor(scope: Construct, options: ResourceModuleOptions<'namespace', KubernetesCredentials>) {
    super(scope, options);

    this.namespace = new Namespace(this, 'namespace', {
      metadata: {
        name: this.inputs?.name || 'unknown',
      },
    });

    this.outputs = {
      id: this.namespace.metadata.name,
    };
  }

  genImports(resourceId: string): Promise<Record<string, string>> {
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
