import * as kubernetes from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';

const config = new pulumi.Config();
const provider = new kubernetes.Provider('provider', {
  kubeconfig: config.require('kubeconfig'),
});

const hostParts: string[] = [];

const subdomain = config.get('subdomain');
if (subdomain) {
  hostParts.push(subdomain);
}

const dns_zone = config.get('dns_zone');
if (dns_zone) {
  hostParts.push(dns_zone);
}

const _host = hostParts.join('.');
const serviceConfig = config.requireObject<{ host: string; port: string; protocol: string }>('service');

const ingress = new kubernetes.networking.v1.Ingress('ingress', {
  metadata: {
    name: config.require('name').replace(/\//g, '-'),
    namespace: config.require('namespace'),
    annotations: {
      'cert-manager.io/issuer': 'letsencrypt'
    }
  },
  spec: {
    ingressClassName: config.get('ingress_class_name'),
    rules: [
      {
        host: _host,
        http: {
          paths: [
            {
              pathType: 'Prefix',
              path: config.get('path') ?? '/',
              backend: {
                service: {
                  name: serviceConfig.host,
                  port: {
                    number: parseInt(serviceConfig.port),
                  }
                }
              }
            }
          ],
        }
      }
    ]
  }
}, { provider });

export const id = ingress.id;
export const protocol = serviceConfig.protocol === 'http' ? 'https' : serviceConfig.protocol || 'https';
export const host = _host;
export const port = 443;
export const username = config.get('username');
export const password = config.get('password');
export const path = config.get('path') ?? '';

let _url = `${protocol}://`;
if (username || password) {
  _url += `${username}:${password}@`;
}

_url += `${host}${path.replace(/\/$/, '')}`;

export const url = _url;
export const load_balancer_ip = ingress.status.loadBalancer.ingress[0].ip;
