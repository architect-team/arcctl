import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ResourceService } from '../../service.ts';
import { DigitaloceanCredentials } from '../credentials.ts';
import { DigitaloceanKubernetesClusterModule } from '../modules/kubernetes-cluster.ts';
import { createApiClient } from 'dots-wrapper';

export class DigitaloceanKubernetesClusterService extends ResourceService<
  'kubernetesCluster',
  DigitaloceanCredentials
> {
  private client: ReturnType<typeof createApiClient>;

  constructor(credentials: DigitaloceanCredentials) {
    super();
    this.client = createApiClient({ token: credentials.token });
  }

  async get(
    id: string,
  ): Promise<ResourceOutputs['kubernetesCluster'] | undefined> {
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
        provider: '',
      };
    } catch {
      return undefined;
    }
  }

  // TODO: Implement filterOptions
  async list(
    filterOptions?: Partial<ResourceOutputs['kubernetesCluster']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['kubernetesCluster']>> {
    const {
      data: { meta, kubernetes_clusters },
    } = await this.client.kubernetes.listKubernetesClusters({
      per_page: pagingOptions?.limit,
      page:
        pagingOptions?.offset && pagingOptions.limit
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
        provider: '',
      })),
    };
  }

  manage = {
    validators: {
      name: (input: string) =>
        /^[\d.A-Za-z-]+$/.test(input) ||
        'Must be unique and contain alphanumeric characters, dashes, and periods only.',
      'nodePools.name': (input: string) =>
        /^[\d.A-Za-z-]+$/.test(input) ||
        'Must be unique and contain alphanumeric characters, dashes, and periods only.',
      description: (input?: string) =>
        !input ||
        input.length <= 255 ||
        'Description must be less than 255 characters',
    },

    presets: [
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
    ],

    module: DigitaloceanKubernetesClusterModule,
  };
}
