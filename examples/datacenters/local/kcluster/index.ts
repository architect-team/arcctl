import * as digitalocean from "@pulumi/digitalocean";
import * as pulumi from "@pulumi/pulumi";
import * as fs from "fs";
import { promisify } from "util";

const writeFileAsync = promisify(fs.writeFile);

let filePath = "/tmp/myPulumiOutput.txt";

// Export the file path
export const outputPath = pulumi.output(filePath);

const config = new pulumi.Config();
const vpcId = config.require("vpc-id");

const cluster = new digitalocean.KubernetesCluster("my-cluster", {
  region: "nyc3",
  version: "1.27.4-do.0",
  nodePool: {
    name: "default",
    size: "s-1vcpu-2gb",
    nodeCount: 1,
  },
  vpcUuid: vpcId,
});

pulumi.interpolate`apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: ${cluster.kubeConfigs[0].clusterCaCertificate}
    server: ${cluster.endpoint}
  name: cluster
contexts:
- context:
    cluster: cluster
    user: cluster
  name: cluster
current-context: cluster
kind: Config
preferences: {}
users:
- name: cluster
  user:
    token: ${cluster.kubeConfigs[0].token}`.apply(async (content) => {
      await writeFileAsync(filePath, content);
     });

export const id = cluster.id;
export const name = cluster.name;
export const vpc = cluster.vpcUuid;
export const kubernetesVersion = cluster.version;
export const configPath = pulumi.output(filePath);
