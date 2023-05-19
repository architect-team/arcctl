import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.js';
import { ResourceModule } from '../../module.js';
import { Service } from '../.gen/providers/kubernetes/service/index.js';
import { KubernetesCredentials } from '../credentials.js';
import { Construct } from 'constructs';

export class KubernetesServiceModule extends ResourceModule<
  'service',
  KubernetesCredentials
> {
  private service: Service;
  outputs: ResourceOutputs['service'];

  constructor(scope: Construct, id: string, inputs: ResourceInputs['service']) {
    super(scope, id, inputs);

    this.service = new Service(this, inputs.name, {
      metadata: {
        name: inputs.name.replace(/\//g, '--'),
        namespace: inputs.namespace,
        labels: {
          'architect.io/name': inputs.name.replace(/\//g, '--'),
          ...inputs.labels,
        },
      },
      spec:
        'external_name' in inputs
          ? {
              type: 'ExternalName',
              externalName: inputs.external_name,
            }
          : {
              type: 'ClusterIP',
              selector: {
                'architect.io/name': inputs.selector.replace(/\//g, '--'),
              },
              port: [
                {
                  port: 80,
                  nodePort: inputs.listener_port,
                  targetPort: String(inputs.target_port),
                },
              ],
            },
    });

    const protocol = 'external_name' in inputs ? 'http' : inputs.protocol;
    this.outputs = {
      id: inputs.name,
      protocol,
      host: inputs.name.replace(/\//g, '--'),
      port: 80,
      url: `${protocol}://${inputs.name.replace(/\//g, '--')}`,
    };
  }

  async genImports(
    credentials: KubernetesCredentials,
    resourceId: string,
  ): Promise<Record<string, string>> {
    return {
      [this.getResourceRef(this.service)]: resourceId,
    };
  }

  getDisplayNames(): Record<string, string> {
    return {
      [this.getResourceRef(this.service)]: 'Service',
    };
  }
}
