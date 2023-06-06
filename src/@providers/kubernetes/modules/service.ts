import { ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule, ResourceModuleOptions } from '../../module.ts';
import { Service } from '../.gen/providers/kubernetes/service/index.ts';
import { KubernetesCredentials } from '../credentials.ts';
import { Construct } from 'constructs';

export class KubernetesServiceModule extends ResourceModule<'service', KubernetesCredentials> {
  private service: Service;
  outputs: ResourceOutputs['service'];

  constructor(scope: Construct, options: ResourceModuleOptions<'service'>) {
    super(scope, options);

    this.service = new Service(this, 'service', {
      metadata: {
        name: this.inputs?.name.replaceAll('/', '--'),
        namespace: this.inputs?.namespace,
        labels: {
          'architect.io/name': this.inputs?.name.replaceAll('/', '--') || 'unknown',
          ...this.inputs?.labels,
        },
      },
      spec:
        this.inputs && 'external_name' in this.inputs
          ? {
              type: 'ExternalName',
              externalName: this.inputs.external_name,
            }
          : {
              type: 'ClusterIP',
              selector: this.inputs?.selector
                ? {
                    'architect.io/name': this.inputs.selector.replaceAll('/', '--'),
                  }
                : undefined,
              port: [
                {
                  port: 80,
                  nodePort: this.inputs?.listener_port,
                  targetPort: String(this.inputs?.target_port || 80),
                },
              ],
            },
    });

    const protocol = this.inputs && 'external_name' in this.inputs ? 'http' : this.inputs?.protocol || 'http';
    this.outputs = {
      id: this.inputs?.name || 'unknown',
      protocol,
      host: this.inputs?.name.replaceAll('/', '--') || 'unknown',
      port: 80,
      url: `${protocol}://${this.inputs?.name.replaceAll('/', '--') || 'unknown'}`,
    };
  }

  genImports(_credentials: KubernetesCredentials, resourceId: string): Promise<Record<string, string>> {
    return Promise.resolve({
      [this.getResourceRef(this.service)]: resourceId,
    });
  }

  getDisplayNames(): Record<string, string> {
    return {
      [this.getResourceRef(this.service)]: 'Service',
    };
  }
}
