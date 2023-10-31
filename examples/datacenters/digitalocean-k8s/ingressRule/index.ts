import * as kubernetes from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();
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

const serviceConfig = config.requireObject<{ host: string; port: string; protocol: string }>('service');

const ingress = new kubernetes.networking.v1.Ingress("ingress", {
  metadata: {
    name: config.require('name').replace(/\//g, '-'),
    namespace: config.require('namespace'),
  },
  spec: {
    ingressClassName: config.get('ingress_class_name'),
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

export const id = ingress.id.apply(id => id.toString());
export const protocol = serviceConfig.protocol || 'http';
export const host = hostParts.join('.');
export const port = 80;
export const username = config.get('username');
export const password = config.get('password');
export const path = config.get('path') ?? '/';

let _url = `${protocol}://`;
if (username || password) {
  _url += `${username}:${password}@`;
}

_url += `${host}:${port}${path}`;

export const url = _url;
export const load_balancer_ip = ingress.status.loadBalancer.ingress[0].ip.apply(ip => ip.toString());
