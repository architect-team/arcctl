import { Construct } from 'constructs';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule, ResourceModuleOptions } from '../../module.ts';
import { IngressV1 } from '../.gen/providers/kubernetes/ingress-v1/index.ts';
import { KubernetesCredentials } from '../credentials.ts';

export class KubernetesIngressRuleModule extends ResourceModule<'ingressRule', KubernetesCredentials> {
  ingress: IngressV1;
  outputs: ResourceOutputs['ingressRule'];

  constructor(scope: Construct, options: ResourceModuleOptions<'ingressRule', KubernetesCredentials>) {
    super(scope, options);

    const dnsZone = this.inputs?.dnsZone || '';
    const hostParts = [dnsZone];

    if (this.inputs?.subdomain) {
      hostParts.unshift(this.inputs.subdomain);
    }

    const host = hostParts.join('.');
    let service_name = this.inputs?.service.replace(/\//g, '--') || 'unknown';
    if (this.inputs?.namespace && service_name.startsWith(this.inputs.namespace)) {
      // Remove namespace + initial '--' from the beginning of the service name
      // if it was included in the service input.
      service_name = service_name.substring(this.inputs.namespace.length + 2);
    }
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
                      name: service_name,
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
    url += this.inputs?.path || '';

    const ip_address = this.ingress.status.get(0).loadBalancer.get(0).ingress.get(0).ip;

    const hostname = this.ingress.status.get(0).loadBalancer.get(0).ingress.get(0).hostname;

    this.outputs = {
      id: `${this.ingress.metadata.namespace}/${this.ingress.metadata.name}`,
      host,
      dnsZone,
      port: this.inputs?.port || 80,
      path: this.inputs?.path || '/',
      url,
      loadBalancerHostname: `\${${ip_address} != "" ? ${ip_address} : ${hostname}}`,
    };
  }

  genImports(_resourceId: string): Promise<Record<string, string>> {
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
