import * as kubernetes from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();
const service = config.requireObject('service') as {
  host: string,
  port: string,
  protocol: string
};

const namespace = config.require("namespace");

const provider = new kubernetes.Provider("provider", {
  kubeconfig: config.require("kubeconfig"),
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

const name = config.require('name').replace(/\//g, '-');
const componentName = config.require('component_name').replace(/\//g, '-');
const is_internal = config.requireBoolean('internal');
let loadbalancerName = namespace;
if (is_internal) {
  loadbalancerName += '-internal';
}

const ingress = new kubernetes.networking.v1.Ingress("ingress", {
  metadata: {
    name: `${componentName}--${name}`,
    namespace,
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
              path: config.get('path') ?? '/',
              backend: {
                service: {
                  name: service.host,
                  port: {
                    number: parseInt(service.port),
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

export const id = ingress.id.apply(id => id.toString());
export const protocol = service.protocol || 'http';
export const host = hostParts.join('.');
export const port = 80;
export const username = config.get('username');
export const password = config.get('password');
export const path = config.get('path') ?? '/';

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
export const lb_address = ingress.status.loadBalancer.ingress[0].hostname.apply(hostname => hostname.toString());
export const alb_name = namespace;