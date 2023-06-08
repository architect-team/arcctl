import { Construct } from 'constructs';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule, ResourceModuleOptions } from '../../module.ts';
import { IngressV1 } from '../.gen/providers/kubernetes/ingress-v1/index.ts';
import { KubernetesCredentials } from '../credentials.ts';

export class KubernetesIngressRuleModule extends ResourceModule<'ingressRule', KubernetesCredentials> {
  ingress: IngressV1;
  outputs: ResourceOutputs['ingressRule'];

  constructor(scope: Construct, options: ResourceModuleOptions<'ingressRule'>) {
    super(scope, options);

    const hostParts = [];
    if (this.inputs?.subdomain) {
      hostParts.push(this.inputs.subdomain);
    }

    if (this.inputs?.dnsZone) {
      hostParts.push(this.inputs.dnsZone);
    }

    const host = hostParts.join('.');
    this.ingress = new IngressV1(this, 'ingress', {
      waitForLoadBalancer: true,
      metadata: {
        name: options.id.replaceAll('/', '--').toLowerCase(),
        namespace: this.inputs?.namespace,
      },
      spec: {
        ingressClassName: this.inputs?.registry,
        rule: [
          {
            host,
            http: {
              path: [
                {
                  path: this.inputs?.path || '/',
                  backend: {
                    service: {
                      name: this.inputs?.service.replace(/\//g, '--') || 'unknown',
                      port: {
                        number: Number(this.inputs?.port || 80),
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
    if (this.inputs?.port && this.inputs.port !== 80) {
      url += ':' + this.inputs.port;
    }
    url += this.inputs?.path || '/';

    const ip_address = this.ingress.status.get(0).loadBalancer.get(0).ingress.get(0).ip;

    const hostname = this.ingress.status.get(0).loadBalancer.get(0).ingress.get(0).hostname;

    this.outputs = {
      id: `${this.ingress.metadata.namespace}/${this.ingress.metadata.name}`,
      host,
      port: this.inputs?.port || 80,
      path: this.inputs?.path || '/',
      url,
      loadBalancerHostname: `\${${ip_address} != "" ? ${ip_address} : ${hostname}}`,
    };
  }

  genImports(_credentials: KubernetesCredentials, _resourceId: string): Promise<Record<string, string>> {
    return Promise.resolve({
      [this.getResourceRef(this.ingress)]: 'Ingress Rule',
    });
  }

  getDisplayNames(): Record<string, string> {
    return {
      [this.getResourceRef(this.ingress)]: 'Ingress Rule',
    };
  }
}
