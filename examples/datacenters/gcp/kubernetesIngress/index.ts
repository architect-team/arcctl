import * as kubernetes from '@pulumi/kubernetes';

const inputs = process.env.INPUTS;
if (!inputs) {
  throw new Error('Missing configuration. Please provide it via the INPUTS environment variable.');
}

type Config = {
  name: string;
  namespace?: string;
  ingress_class_name?: string;
  path?: string;
  kubeconfig: string;
  subdomain?: string;
  dns_zone?: string;
  username?: string;
  password?: string;
  service: {
    host: string;
    port: string;
    protocol: string;
  };
};

const config: Config = JSON.parse(inputs);

const provider = new kubernetes.Provider('provider', {
  kubeconfig: config.kubeconfig,
});

const hostParts: string[] = [];

if (config.subdomain) {
  hostParts.push(config.subdomain);
}

if (config.dns_zone) {
  hostParts.push(config.dns_zone);
}

const _host = hostParts.join('.');

const ingress = new kubernetes.networking.v1.Ingress('ingress', {
  metadata: {
    name: config.name.replace(/\//g, '-'),
    namespace: config.namespace,
    annotations: {
      'cert-manager.io/issuer': 'letsencrypt'
    }
  },
  spec: {
    ingressClassName: config.ingress_class_name,
    rules: [
      {
        host: _host,
        http: {
          paths: [
            {
              pathType: 'Prefix',
              path: config.path ?? '/',
              backend: {
                service: {
                  name: config.service.host,
                  port: {
                    number: parseInt(config.service.port),
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
export const protocol = config.service.protocol || 'http';
export const host = _host;
export const port = 443;
export const username = config.username;
export const password = config.password;
export const path = config.path ?? '';

let _url = `${protocol}://`;
if (username || password) {
  _url += `${username}:${password}@`;
}

_url += `${host}${path.replace(/\/$/, '')}`;

export const url = _url;
export const load_balancer_ip = ingress.status.loadBalancer.ingress[0].ip;
