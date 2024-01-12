import * as kubernetes from "@pulumi/kubernetes";

const inputs = process.env.INPUTS;
if (!inputs) {
  throw new Error('Missing configuration. Please provide it via the INPUTS environment variable.');
}

type Config = {
  name: string;
  namespace: string;
  kubeconfig: string;
  component_name: string;
  internal: boolean;
  path?: string;
  subdomain?: string;
  dns_zone?: string;
  username?: string;
  password?: string;
  service: {
    host: string;
    port: string;
    protocol: string;
  };
}

const config: Config = JSON.parse(inputs);

const provider = new kubernetes.Provider("provider", {
  kubeconfig: config.kubeconfig,
});

const hostParts: string[] = [];

const subdomain = config.subdomain;
if (subdomain) {
  hostParts.push(subdomain);
}

const dns_zone = config.dns_zone;
if (dns_zone) {
  hostParts.push(dns_zone);
}

const name = config.name.replace(/\//g, '-');
const componentName = config.component_name.replace(/\//g, '-');
const is_internal = config.internal;
let loadbalancerName = config.namespace;
if (is_internal) {
  loadbalancerName += '-internal';
}

const ingress = new kubernetes.networking.v1.Ingress("ingress", {
  metadata: {
    name: `${componentName}--${name}`,
    namespace: config.namespace,
    annotations: {
      'kubernetes.io/ingress.class': 'alb',
      'alb.ingress.kubernetes.io/load-balancer-name': loadbalancerName,
      'alb.ingress.kubernetes.io/group.name': loadbalancerName,
      'alb.ingress.kubernetes.io/target-type': 'instance',
      'alb.ingress.kubernetes.io/scheme': is_internal ? 'internal' : 'internet-facing'
    }
  },
  spec: {
    ingressClassName: 'alb',
    rules: [
      {
        host: hostParts.join('.'),
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

export const id = ingress.id.apply((id: any) => id.toString());
export const protocol = config.service.protocol || 'http';
export const host = hostParts.join('.');
export const port = 80;
export const username = config.username;
export const password = config.password;
export const path = config.path ?? '/';

let _url = `${protocol}://`;
if (username || password) {
  _url += `${username}:${password}@`;
}

_url += `${host}:${port}`

// Only add path if the path is more than just '/'
if (path !== '/') {
  _url += `${path}`;
}

export const url = _url;
export const lb_address = ingress.status.loadBalancer.ingress[0].hostname.apply((hostname: any) => hostname.toString());
export const alb_name = config.namespace;