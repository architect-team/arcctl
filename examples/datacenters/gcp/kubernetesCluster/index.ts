import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import * as fs from 'fs';

const config = new pulumi.Config('kubernetes');
const gcpConfig = new pulumi.Config('gcp');

const _computeProjectService = new gcp.projects.Service('cluster-compute-service', {
  service: 'compute.googleapis.com',
  disableOnDestroy: false,
});

const _clusterProjectService = new gcp.projects.Service('cluster-container-service', {
  service: 'container.googleapis.com',
  disableOnDestroy: false,
});

const cluster = new gcp.container.Cluster(config.require('name'), {
  name: config.require('name'),
  description: config.get('description'),
  initialNodeCount: 1,
  location: gcpConfig.require('region'),
  masterAuth: {
    clientCertificateConfig: {
      issueClientCertificate: true
    }
  },
  networkingMode: 'VPC_NATIVE',
  ipAllocationPolicy: {
    stackType: 'IPV4'
  },
  network: config.require('vpc'),
  removeDefaultNodePool: true
}, {
  dependsOn: [_computeProjectService, _clusterProjectService]
});

const nodePools = [];
for (const nodePool of JSON.parse(config.require('nodePools'))) {
  nodePools.push(new gcp.container.NodePool(nodePool.name, {
    cluster: cluster.name,
    name: nodePool.name, 
    location: gcpConfig.require('region'),
    initialNodeCount: nodePool.count,
    nodeConfig: {
      machineType: nodePool.nodeSize,
      oauthScopes: ['https://www.googleapis.com/auth/cloud-platform']
    }
  }));
}

const clientConfig = await gcp.organizations.getClientConfig({});
const kubeConfigPath = 'config.yaml';
cluster.name.apply(clusterName => 
  cluster.endpoint.apply(clusterEndpoint => 
    cluster.masterAuth.clusterCaCertificate.apply(clusterCaCertificate =>
      fs.writeFileSync(kubeConfigPath, `
apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: ${clusterCaCertificate}
    server: https://${clusterEndpoint}
  name: ${clusterName}
contexts:
- context:
    cluster:  ${clusterName}
    user:  ${clusterName}
  name:  ${clusterName}
current-context:  ${clusterName}
kind: Config
preferences: {}
users:
- name:  ${clusterName}
  user:
    token: ${clientConfig.accessToken}
`
      )
    )
  )
);

export const id = cluster.id;
export const name = cluster.name;
export const vpc = cluster.network;
export const kubernetesVersion = cluster.masterVersion;
export const description = cluster.description;
export const configPath = kubeConfigPath;
