import * as kubernetes from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();
const serviceConfig = new pulumi.Config("service");
const service = {
  host: serviceConfig.require("host"),
  port: serviceConfig.require("port"),
  protocol: serviceConfig.require("protocol"),
};
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
const ingress = new kubernetes.networking.v1.Ingress("ingress", {
  metadata: {
    name: name,
    namespace: config.require('namespace'),
    annotations: {
      'kubernetes.io/ingress.class': 'alb',
      'alb.ingress.kubernetes.io/load-balancer-name': name,
      'alb.ingress.kubernetes.io/target-type': 'instance',
      'alb.ingress.kubernetes.io/scheme': 'internet-facing' // TODO: Dont do this if its private
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

_url += `${host}:${port}${path}`;

export const url = _url;
export const lb_address = ingress.status.loadBalancer.ingress[0].hostname.apply(hostname => hostname.toString());
