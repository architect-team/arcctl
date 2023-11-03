import * as kubernetes from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();
const name = config.require("name");
const clusterName = config.require("clusterName");

const provider = new kubernetes.Provider("provider", {
  kubeconfig: config.require("kubeconfig"),
});

const controller = new kubernetes.helm.v3.Release("aws-lb-controller", {
  name,
  namespace: 'kube-system',
  chart: 'aws-load-balancer-controller',
  version: '1.6.1',
  repositoryOpts: {
    repo: "https://aws.github.io/eks-charts",
  },
  values: {
    clusterName,
  },
}, { provider });

export const id = controller.id.apply(id => id.toString());