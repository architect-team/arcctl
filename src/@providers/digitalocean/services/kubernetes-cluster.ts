import { Construct } from 'constructs';
import { createApiClient } from 'dots-wrapper';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { InputValidators, ResourcePresets } from '../../base.service.ts';
import { ProviderStore } from '../../store.ts';
import { TerraformResourceService } from '../../terraform.service.ts';
import { DigitaloceanProvider as TerraformDigitaloceanProvider } from '../.gen/providers/digitalocean/provider/index.ts';
import { DigitaloceanCredentials } from '../credentials.ts';
import { DigitaloceanKubernetesClusterModule } from '../modules/kubernetes-cluster.ts';

export class DigitaloceanKubernetesClusterService extends TerraformResourceService<
  'kubernetesCluster',
  DigitaloceanCredentials
> {
  private client: ReturnType<typeof createApiClient>;

  readonly terraform_version = '1.4.5';
  readonly construct = DigitaloceanKubernetesClusterModule;

  constructor(accountName: string, credentials: DigitaloceanCredentials, providerStore: ProviderStore) {
    super(accountName, credentials, providerStore);
    this.client = createApiClient({ token: credentials.token });
  }

  public configureTerraformProviders(scope: Construct): TerraformDigitaloceanProvider {
    return new TerraformDigitaloceanProvider(scope, 'digitalocean', {
      token: this.credentials.token,
    });
  }

  async get(id: string): Promise<ResourceOutputs['kubernetesCluster'] | undefined> {
    try {
      const {
        data: { kubernetes_cluster },
      } = await this.client.kubernetes.getKubernetesCluster({
        kubernetes_cluster_id: id,
      });

      return {
        id: kubernetes_cluster.id,
        vpc: kubernetes_cluster.vpc_uuid,
        name: kubernetes_cluster.name,
        kubernetesVersion: kubernetes_cluster.version,
        configPath: '',
      };
    } catch {
      return undefined;
    }
  }

  // TODO: Implement filterOptions
  async list(
    _filterOptions?: Partial<ResourceOutputs['kubernetesCluster']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['kubernetesCluster']>> {
    const {
      data: { meta, kubernetes_clusters },
    } = await this.client.kubernetes.listKubernetesClusters({
      per_page: pagingOptions?.limit,
      page: pagingOptions?.offset && pagingOptions.limit
        ? Math.floor(pagingOptions.offset / pagingOptions.limit)
        : undefined,
    });

    return {
      total: meta?.total || 0,
      rows: kubernetes_clusters.map((cluster) => ({
        id: cluster.id,
        name: cluster.name,
        vpc: cluster.vpc_uuid,
        kubernetesVersion: cluster.version,
        configPath: '',
      })),
    };
  }

  get validators(): InputValidators<'kubernetesCluster'> {
    return {
      name: (input: string) =>
        /^[\d.A-Za-z-]+$/.test(input) ||
        'Must be unique and contain alphanumeric characters, dashes, and periods only.',
      // TODO: Fix typing on this
      // 'nodePools.name': (input: string) =>
      //   /^[\d.A-Za-z-]+$/.test(input) ||
      //   'Must be unique and contain alphanumeric characters, dashes, and periods only.',
      description: (input?: string) => !input || input.length <= 255 || 'Description must be less than 255 characters',
    };
  }

  get presets(): ResourcePresets<'kubernetesCluster'> {
    return [
      {
        display: 'Minimum (Cheapest)',
        values: {
          nodePools: [
            {
              name: 'nodepool1',
              count: 1,
              nodeSize: 's-1vcpu-2gb',
            },
          ],
        },
      },
      {
        display: 'Best practice',
        values: {
          nodePools: [
            {
              name: 'nodepool1',
              count: 3,
              nodeSize: 's-2vcpu-4gb',
            },
          ],
        },
      },
    ];
  }
}
