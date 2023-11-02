import * as kubernetes from "@pulumi/kubernetes";
import * as pulumi from '@pulumi/pulumi';

const config = new pulumi.Config('kubernetesIngress');

const kubernetesProvider = new kubernetes.Provider('provider', {
  kubeconfig: config.require('kubeconfig'),
});
const appName = config.require('name');
const ingress = new kubernetes.networking.v1.Ingress(appName, {
  metadata: {
    name: appName,
    namespace: config.get('namespace')
  },
  spec: {
    rules: [{
      http: {
        paths: [{
          backend: {
            service: {
              name: appName,
              port: {
                number: parseInt(config.require('port')),
              },
            },
          },
          path: "/",
          pathType: "Prefix",
        }],
      },
    }],
  },
}, {
  provider: kubernetesProvider
});
