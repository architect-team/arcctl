import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule } from '../../module.ts';
import { IngressV1 } from '../.gen/providers/kubernetes/ingress-v1/index.ts';
import { KubernetesCredentials } from '../credentials.ts';
import { Construct } from 'npm:constructs';

export class KubernetesIngressRuleModule extends ResourceModule<
  'ingressRule',
  KubernetesCredentials
> {
  ingress: IngressV1;
  outputs: ResourceOutputs['ingressRule'];

  constructor(
    scope: Construct,
    id: string,
    inputs: ResourceInputs['ingressRule'],
  ) {
    super(scope, id, inputs);

    const hostParts = [];
    if (inputs.listener?.subdomain) {
      hostParts.push(inputs.listener.subdomain);
    }

    if (inputs.listener?.hostZone) {
      hostParts.push(inputs.listener.hostZone);
    }

    const host = hostParts.join('.');
    this.ingress = new IngressV1(this, 'ingress', {
      waitForLoadBalancer: true,
      metadata: {
        name: id.replace(/\//g, '--'),
        namespace: inputs.namespace,
      },
      spec: {
        ingressClassName: inputs.loadBalancer,
        rule: [
          {
            host,
            http: {
              path: [
                {
                  path: inputs.listener?.path || '/',
                  backend: {
                    service: {
                      name: inputs.service.replace(/\//g, '--'),
                      port: {
                        number: Number(inputs.port),
                      },
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    });

    let url = `http://${host}`;
    if (inputs.port !== 80) {
      url += ':' + inputs.port;
    }
    url += inputs.listener?.path || '/';

    this.outputs = {
      id: `${this.ingress.metadata.namespace}/${this.ingress.metadata.name}`,
      host,
      port: inputs.port,
      path: inputs.listener?.path || '/',
      url,
      loadBalancerHostname: this.ingress.status
        .get(0)
        .loadBalancer.get(0)
        .ingress.get(0).ip,
    };
  }

  async genImports(
    credentials: KubernetesCredentials,
    resourceId: string,
  ): Promise<Record<string, string>> {
    return {
      [this.getResourceRef(this.ingress)]: 'Ingress Rule',
    };
  }

  getDisplayNames(): Record<string, string> {
    return {
      [this.getResourceRef(this.ingress)]: 'Ingress Rule',
    };
  }
}
