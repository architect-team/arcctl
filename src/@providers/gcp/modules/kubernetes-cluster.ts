import { Construct } from 'constructs';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule, ResourceModuleOptions } from '../../module.ts';
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

  constructor(scope: Construct, options: ResourceModuleOptions<'kubernetesCluster', GoogleCloudCredentials>) {
    super(scope, options);

    GcpUtils.configureProvider(this);

    const depends_on = this.inputs?.name
      ? [
        new ProjectService(this, 'cluster-compute-service', {
          service: 'compute.googleapis.com',
          disableOnDestroy: false,
        }),
        new ProjectService(this, 'cluster-container-service', {
          service: 'container.googleapis.com',
          disableOnDestroy: false,
        }),
      ]
      : [];

    this.cluster = new ContainerCluster(this, 'cluster', {
      dependsOn: depends_on,
      initialNodeCount: 1,
      location: this.inputs?.region,
      name: this.inputs?.name || 'deleting',
      masterAuth: {
        clientCertificateConfig: {
          issueClientCertificate: true,
        },
      },
      networkingMode: 'VPC_NATIVE',
      ipAllocationPolicy: {
        stackType: 'IPV4',
      },
      network: this.inputs?.vpc,
      description: this.inputs?.description,
      removeDefaultNodePool: true,
    });

    const nodePools = [];
    const region = this.inputs!.region;
    for (let i = 0; i < (this.inputs?.nodePools || []).length; i++) {
      const nodePool = this.inputs!.nodePools[i];
      nodePools.push(
        new ContainerNodePool(this, nodePool.name, {
          cluster: this.cluster.name,
          name: nodePool.name,
          location: region,
          nodeLocations: [region],
          initialNodeCount: nodePool.count,
          nodeConfig: {
            machineType: nodePool.nodeSize,
            oauthScopes: ['https://www.googleapis.com/auth/cloud-platform'],
          },
        }),
      );
    }

    this.clientConfig = new DataGoogleClientConfig(this, 'client', {});

    const clusterName = `gke_${this.credentials.project}_${region}_${this.cluster.name}`;

    // https://cloud.google.com/kubernetes-engine/docs/how-to/api-server-authentication#environments-without-gcloud
    const file = new options.FileConstruct(this, 'configFile', {
      filename: 'config.yml',
      content: `apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: ${this.cluster.masterAuth.clusterCaCertificate}
    server: https://${this.cluster.endpoint}
  name: ${clusterName}
contexts:
- context:
    cluster: ${clusterName}
    user: ${clusterName}
  name: ${clusterName}
current-context: ${clusterName}
kind: Config
preferences: {}
users:
- name: ${clusterName}
  user:
    exec:
      apiVersion: client.authentication.k8s.io/v1beta1
      args:
      - --use_application_default_credentials
      command: gke-gcloud-auth-plugin
      provideClusterInfo: true`,
    });

    this.outputs = {
      id: this.cluster.id,
      name: this.cluster.name,
      vpc: this.cluster.network,
      kubernetesVersion: this.cluster.masterVersion,
      description: this.cluster.description,
      configPath: file.filename,
    };
  }

  async genImports(resourceId: string): Promise<Record<string, string>> {
    const match = resourceId.match(/^([\dA-Za-z-]+)\/([\w-]+)$/);
    if (!match) {
      throw new Error('ID must be of the format, <region>/<name>');
    }
    const [_, zone, name] = match;
    const import_ids = await GcpUtils.getClusterImportIds(this.credentials, this.credentials.project, name, zone);

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
    };
  }

  getDisplayNames(): Record<string, string> {
    return {
      [this.getResourceRef(this.cluster)]: 'Kubernetes Cluster',
    };
  }
}
