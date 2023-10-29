import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();
const namespace = config.require("namespace");
const deploymentName = config.require("name").replace(/\//g, '-').replace(/_/g, '-');
const image = config.require("image");
const environment: Record<string, string> = config.getObject("environment") ?? {};
const replicas = config.getNumber("replicas") ?? 1;

const provider = new k8s.Provider("provider", {
  kubeconfig: config.require("kubeconfig"),
});

const appLabels = { app: deploymentName };
const deployment = new k8s.apps.v1.Deployment(deploymentName, {
    spec: {
        selector: { matchLabels: appLabels },
        replicas,
        template: {
          metadata: { labels: appLabels },
          spec: {
            containers: [{
              name: deploymentName,
              image,
              env: Object.entries(environment).map(([name, value]) => ({ name, value }))
            }],
          }
        }
    }
}, {
  provider
});

export const id = `${namespace}/${deploymentName}`;
