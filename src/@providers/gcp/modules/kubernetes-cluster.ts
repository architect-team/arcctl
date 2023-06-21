import { TerraformOutput } from 'cdktf';
import { Construct } from 'constructs';
import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import Terraform from '../../../utils/terraform.ts';
import KubernetesUtils from '../../kubernetes.ts';
import { ResourceModule } from '../../module.ts';
import { ContainerCluster } from '../.gen/providers/google/container-cluster/index.ts';
import { ContainerNodePool } from '../.gen/providers/google/container-node-pool/index.ts';
import { DataGoogleClientConfig } from '../.gen/providers/google/data-google-client-config/index.ts';
import { ProjectService } from '../.gen/providers/google/project-service/index.ts';
import { GoogleCloudCredentials } from '../credentials.ts';
import GcpUtils from '../utils.ts';

export class GoogleCloudKubernetesClusterModule extends ResourceModule<
  'kubernetesCluster',
  GoogleCloudCredentials
> {
  private cluster: ContainerCluster;
  outputs: ResourceOutputs['kubernetesCluster'];

  private clientConfig: DataGoogleClientConfig;
  private clusterEndpointOutput: TerraformOutput;
  private clusterCaOutput: TerraformOutput;
  private clusterToken: TerraformOutput;

  constructor(
    scope: Construct,
    private id: string,
    inputs: ResourceInputs['kubernetesCluster'],
  ) {
    super(scope, id, inputs);

    const depends_on = this.inputs.name ? [
      new ProjectService(this, 'cluster-compute-service', {
        service: 'compute.googleapis.com',
      }),
      new ProjectService(this, 'cluster-container-service', {
        service: 'container.googleapis.com',
      }),
    ] : [];

    this.cluster = new ContainerCluster(this, 'cluster', {
      dependsOn: depends_on,
      initialNodeCount: 1,
      location: this.inputs.region,
      name: this.inputs.name || 'deleting',
      masterAuth: {
        clientCertificateConfig: {
          issueClientCertificate: true,
        },
      },
      network: inputs.vpc,
      description: this.inputs.description,
      removeDefaultNodePool: true,
    });

    const nodePools = [];
    for (let i = 0; i < (inputs.nodePools || []).length; i++) {
      const nodePool = inputs.nodePools[i];
      nodePools.push(
        new ContainerNodePool(this, nodePool.name, {
          cluster: this.cluster.name,
          name: nodePool.name,
          location: this.inputs.region,
          nodeLocations: [this.inputs.region],
          initialNodeCount: nodePool.count,
          nodeConfig: {
            machineType: nodePool.nodeSize,
            oauthScopes: ['https://www.googleapis.com/auth/cloud-platform'],
          },
        }),
      );
    }

    this.clientConfig = new DataGoogleClientConfig(this, 'client', {});
    this.clusterEndpointOutput = new TerraformOutput(this, 'clusterEndpoint', {
      value: this.cluster.endpoint,
      description: 'Endpoint for EKS control plane',
      sensitive: true,
    });
    this.clusterCaOutput = new TerraformOutput(this, 'clusterCa', {
      value: this.cluster.masterAuth.clusterCaCertificate,
      description: 'CA for EKS control plane',
      sensitive: true,
    });
    this.clusterToken = new TerraformOutput(this, 'clusterClientCert', {
      value: this.clientConfig.accessToken,
      description: 'Client token for EKS control plane',
      sensitive: true,
    });

    this.outputs = {
      type: 'kubernetesCluster',
      id: this.cluster.id,
      name: this.cluster.name,
      vpc: this.cluster.network,
      kubernetesVersion: this.cluster.masterVersion,
      description: this.cluster.description,
    };
  }

  async genImports(
    credentials: GoogleCloudCredentials,
    resourceId: string,
  ): Promise<Record<string, string>> {
    const match = resourceId.match(/^([\dA-Za-z-]+)\/([\w-]+)$/);
    if (!match) {
      throw new Error('ID must be of the format, <region>/<name>');
    }
    const [_, zone, name] = match;
    const import_ids = await GcpUtils.getClusterImportIds(credentials, credentials.project, name, zone);
    this.id = name;

    const node_pools: any = {};
    for (const id of import_ids.nodePoolIds) {
      const node_pool = new ContainerNodePool(this, id, {
        cluster: name,
        name: id,
        nodeLocations: [zone],
        initialNodeCount: 1,
        nodeConfig: {
          machineType: 'n1-standard-1',
          oauthScopes: ['https://www.googleapis.com/auth/cloud-platform'],
        },
      });
      node_pools[this.getResourceRef(node_pool)] = id;
    }

    return {
      [this.getResourceRef(this.cluster)]: import_ids.clusterId,
      // ...node_pools,
    };
  }

  getDisplayNames(): Record<string, string> {
    return {
      [this.getResourceRef(this.cluster)]: 'Kubernetes Cluster',
    };
  }

  hooks = {
    afterCreate: async () => {
      const ca = await Terraform.getOutput(this.clusterCaOutput) || '';
      const token = await Terraform.getOutput(this.clusterToken) || '';
      const endpoint = await Terraform.getOutput(this.clusterEndpointOutput) || '';
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
      await KubernetesUtils.afterCreateClusterHelpText();
    },
    afterDelete: async () => {
      await KubernetesUtils.deleteProvider(this.id);
    },
  };
}
