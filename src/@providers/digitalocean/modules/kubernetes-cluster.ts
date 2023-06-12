import { Construct } from 'constructs';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule, ResourceModuleOptions } from '../../module.ts';
import { KubernetesCluster } from '../.gen/providers/digitalocean/kubernetes-cluster/index.ts';
import { KubernetesNodePool } from '../.gen/providers/digitalocean/kubernetes-node-pool/index.ts';
import { DigitaloceanCredentials } from '../credentials.ts';

export class DigitaloceanKubernetesClusterModule extends ResourceModule<'kubernetesCluster', DigitaloceanCredentials> {
  private cluster: KubernetesCluster;
  outputs: ResourceOutputs['kubernetesCluster'];

  constructor(scope: Construct, options: ResourceModuleOptions<'kubernetesCluster'>) {
    super(scope, options);

    const nodePools = [
      ...(this.inputs?.nodePools || [
        {
          name: 'default',
          nodeSize: 's-1vcpu-2gb',
          count: 1,
        },
      ]),
    ];
    const firstNodePool = nodePools.shift()!;
    this.cluster = new KubernetesCluster(this, 'kubernetesCluster', {
      name: this.inputs?.name || 'unknown',
      region: this.inputs?.region || 'unknown',
      vpcUuid: this.inputs?.vpc || 'unknown',
      version: this.inputs?.kubernetesVersion || 'unknown',
      nodePool: {
        name: firstNodePool.name,
        size: firstNodePool.nodeSize,
        nodeCount: firstNodePool.count,
      },
    });

    for (const pool of nodePools) {
      new KubernetesNodePool(this, pool.name, {
        clusterId: this.cluster.id,
        name: pool.name,
        size: pool.nodeSize,
        nodeCount: pool.count,
      });
    }

    const file = new options.FileConstruct(this, 'configFile', {
      filename: 'config.yml',
      content: `apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: ${this.cluster.kubeConfig.get(0).clusterCaCertificate}
    server: ${this.cluster.endpoint}
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
    token: ${this.cluster.kubeConfig.get(0).token}`,
    });

    this.outputs = {
      id: this.cluster.id,
      name: this.cluster.name,
      vpc: this.inputs?.vpc || 'unknown',
      kubernetesVersion: this.cluster.version,
      configPath: file.filename,
    };
  }

  genImports(_credentials: DigitaloceanCredentials, resourceId: string): Promise<Record<string, string>> {
    return Promise.resolve({
      [this.getResourceRef(this.cluster)]: resourceId,
    });
  }

  getDisplayNames(): Record<string, string> {
    return {
      [this.getResourceRef(this.cluster)]: 'Kubernetes Cluster',
    };
  }
}
