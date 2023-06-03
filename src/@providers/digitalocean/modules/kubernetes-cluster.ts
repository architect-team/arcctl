import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule } from '../../module.ts';
import { KubernetesCluster } from '../.gen/providers/digitalocean/kubernetes-cluster/index.ts';
import { KubernetesNodePool } from '../.gen/providers/digitalocean/kubernetes-node-pool/index.ts';
import { DigitaloceanCredentials } from '../credentials.ts';
import { Construct } from 'constructs';

export class DigitaloceanKubernetesClusterModule extends ResourceModule<'kubernetesCluster', DigitaloceanCredentials> {
  private cluster: KubernetesCluster;
  outputs: ResourceOutputs['kubernetesCluster'];

  constructor(scope: Construct, private id: string, readonly inputs: ResourceInputs['kubernetesCluster']) {
    super(scope, id, inputs);

    const nodePools = [
      ...(inputs.nodePools || [
        {
          name: 'default',
          nodeSize: 's-1vcpu-2gb',
          count: 1,
        },
      ]),
    ];
    const firstNodePool = nodePools.shift()!;
    this.cluster = new KubernetesCluster(this, 'kubernetesCluster', {
      name: inputs.name,
      region: inputs.region,
      vpcUuid: inputs.vpc,
      version: inputs.kubernetesVersion || 'version',
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

    this.outputs = {
      id: this.cluster.id,
      name: this.cluster.name,
      vpc: inputs.vpc,
      kubernetesVersion: this.cluster.version,
      account: `kubernetesCluster-${this.cluster.name}`,
    };
  }

  genImports(_credentials: DigitaloceanCredentials, resourceId: string): Promise<Record<string, string>> {
    this.id = resourceId;
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
