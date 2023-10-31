import * as kubernetes from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();

const provider = new kubernetes.Provider("provider", {
  kubeconfig: config.require("kubeconfig"),
});

export const ingress_class_name = config.get('ingress_class_name') ?? 'nginx';

const controller = new kubernetes.helm.v3.Release("nginx-controller", {
  name: 'nginx-ingress',
  chart: 'oci://ghcr.io/nginxinc/charts/nginx-ingress',
  version: '1.0.1',
  values: {
    'controller.ingressClass': ingress_class_name,
  }
}, { provider });

export const id = controller.id.apply(id => id.toString());