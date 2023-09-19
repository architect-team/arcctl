import * as digitalocean from "@pulumi/digitalocean";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();
const vpcId = config.require("vpcId");
const region = config.require("region");
const name = config.require("name");

const cluster = new digitalocean.KubernetesCluster("cluster", {
  name,
  region,
  vpcUuid: vpcId,
  version: "1.28.2-do.0",
  nodePool: {
    name: `${name}-pool-1`,
    size: "s-1vcpu-2gb",
    nodeCount: 1,
  },
});

export const id = cluster.id;
export const kubernetesVersion = cluster.version;
export const kubeconfig = cluster.kubeConfigs[0].rawConfig;
