import { Construct } from 'constructs';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule, ResourceModuleOptions } from '../../module.ts';
import { Service } from '../.gen/providers/kubernetes/service/index.ts';
import { KubernetesCredentials } from '../credentials.ts';

export class KubernetesServiceModule extends ResourceModule<'service', KubernetesCredentials> {
  private service: Service;
  outputs: ResourceOutputs['service'];

  constructor(scope: Construct, options: ResourceModuleOptions<'service', KubernetesCredentials>) {
    super(scope, options);

    const host = this.inputs?.name.replaceAll('/', '--') || 'unknown';

    this.service = new Service(this, 'service', {
      metadata: {
        name: host,
        namespace: this.inputs?.namespace,
        labels: {
          'architect.io/name': host,
          ...this.inputs?.labels,
        },
      },
      spec: this.inputs && 'external_hostname' in this.inputs
        ? {
          type: 'ExternalName',
          externalName: this.inputs.external_hostname,
        }
        : {
          type: 'ClusterIP',
          ...(this.inputs && 'target_deployment' in this.inputs
            ? {
              selector: this.inputs?.target_deployment
                ? {
                  'architect.io/name': this.inputs.target_deployment.replaceAll('/', '--'),
                }
                : undefined,
            }
            : {}),
          port: [
            {
              port: 80,
              targetPort: String(this.inputs?.target_port || 80),
            },
          ],
        },
    });

    const protocol = this.inputs && 'external_hostname' in this.inputs
      ? 'http'
      : this.inputs?.target_protocol || 'http';
    const port = 80;

    let id = host;
    if (this.inputs?.namespace) {
      id = `${this.inputs.namespace}/${id}`;
    }

    let url = `${protocol}://`;
    if (this.inputs?.username) {
      url += `${this.inputs.username}:${this.inputs.password}@`;
    }
    url += host;

    this.outputs = {
      ...this.inputs,
      id,
      protocol,
      host,
      port,
      url,
      username: this.inputs?.username || '',
      password: this.inputs?.password || '',
      account: this.inputs?.account || '',
      name: host,
      target_port: this.inputs?.target_port || 80,
    };
  }

  genImports(resourceId: string): Promise<Record<string, string>> {
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
