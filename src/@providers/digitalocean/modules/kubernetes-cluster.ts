import { TerraformOutput } from 'cdktf';
import { Construct } from 'constructs';
import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import KubernetesUtils from '../../kubernetes.ts';
import { ResourceModule } from '../../module.ts';
import { ProviderStore } from '../../store.ts';
import { SupportedProviders } from '../../supported-providers.ts';
import { KubernetesCluster } from '../.gen/providers/digitalocean/kubernetes-cluster/index.ts';
import { KubernetesNodePool } from '../.gen/providers/digitalocean/kubernetes-node-pool/index.ts';
import { DigitaloceanCredentials } from '../credentials.ts';

export class DigitaloceanKubernetesClusterModule extends ResourceModule<'kubernetesCluster', DigitaloceanCredentials> {
  private cluster: KubernetesCluster;
  outputs: ResourceOutputs['kubernetesCluster'];

  private clusterEndpointOutput: TerraformOutput;
  private clusterCaOutput: TerraformOutput;
  private clusterTokenOutput: TerraformOutput;

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

    this.clusterEndpointOutput = new TerraformOutput(this, 'clusterEndpoint', {
      value: this.cluster.endpoint,
      description: 'Endpoint for control plane',
      sensitive: true,
    });
    this.clusterCaOutput = new TerraformOutput(this, 'clusterCa', {
      value: this.cluster.kubeConfig.get(0).clusterCaCertificate,
      description: 'Certificate authority for control plane',
      sensitive: true,
    });
    this.clusterTokenOutput = new TerraformOutput(this, 'clusterToken', {
      value: this.cluster.kubeConfig.get(0).token,
      description: 'Token for control plane',
      sensitive: true,
    });

    this.outputs = {
      id: this.cluster.id,
      name: this.cluster.name,
      vpc: inputs.vpc,
      kubernetesVersion: this.cluster.version,
      account: `kubernetesCluster-${this.cluster.name}`,
    };
  }

  // deno-lint-ignore require-await
  async genImports(credentials: DigitaloceanCredentials, resourceId: string): Promise<Record<string, string>> {
    this.id = resourceId;
    return {
      [this.getResourceRef(this.cluster)]: resourceId,
    };
  }

  getDisplayNames(): Record<string, string> {
    return {
      [this.getResourceRef(this.cluster)]: 'Kubernetes Cluster',
    };
  }

  hooks = {
    afterCreate: async (
      providerStore: ProviderStore,
      outputs: ResourceOutputs['kubernetesCluster'],
      getOutputValue: (id: string) => Promise<any>,
    ) => {
      const ca = await getOutputValue(this.clusterCaOutput.friendlyUniqueId);
      const token = await getOutputValue(this.clusterTokenOutput.friendlyUniqueId);
      const endpoint = await getOutputValue(this.clusterEndpointOutput.friendlyUniqueId);
      const credentialsYaml = `apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: ${ca}
    server: ${endpoint}
  name: ${this.inputs.name}
contexts:
- context:
    cluster:  ${this.inputs.name}
    user:  ${this.inputs.name}
  name:  ${this.inputs.name}
current-context:  ${this.inputs.name}
kind: Config
preferences: {}
users:
- name:  ${this.inputs.name}
  user:
    token: ${token}`;
      await KubernetesUtils.createProvider(this.inputs.name, credentialsYaml);
      const configFilePath = providerStore.saveFile(`kubernetesCluster-${this.inputs.name}.yml`, credentialsYaml);
      providerStore.saveProvider(
        new SupportedProviders.kubernetes(
          `kubernetesCluster-${this.inputs.name}`,
          {
            configPath: configFilePath,
          },
          providerStore.saveFile.bind(providerStore),
        ),
      );
    },
    afterDelete: async () => {
      await KubernetesUtils.deleteProvider(this.id);
    },
  };
}
