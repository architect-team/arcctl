import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ResourcePresets } from '../../service.ts';
import { TerraformResourceService } from '../../terraform.service.ts';
import { AwsCredentials } from '../credentials.ts';
import { AwsKubernetesClusterModule } from '../modules/kubernetes-cluster.ts';
import AwsUtils from '../utils.ts';
import { AwsRegionService } from './region.ts';

export class AwsKubernetesClusterService extends TerraformResourceService<'kubernetesCluster', AwsCredentials> {
  constructor(private readonly credentials: AwsCredentials) {
    super();
  }

  async get(id: string): Promise<ResourceOutputs['kubernetesCluster'] | undefined> {
    const match = id.match(/^([\dA-Za-z-]+)\/([\w-]+)$/);
    if (!match) {
      throw new Error('ID must be of the format, <region>/<uuid>');
    }

    const [_, region, uuid] = match;
    const eks = AwsUtils.getEKS(this.credentials, region);
    return new Promise((resolve, reject) => {
      eks.describeCluster(
        {
          name: uuid,
        },
        (err, data) => {
          if (err) {
            return resolve(undefined);
          }

          return resolve({
            id: `${region}/${data?.cluster?.name}`,
            vpc: data.cluster?.resourcesVpcConfig?.vpcId || '',
            name: data.cluster?.name || '',
            kubernetesVersion: data.cluster?.version || '',
            account: '',
          });
        },
      );
    });
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['kubernetesCluster']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['kubernetesCluster']>> {
    const regions = await new AwsRegionService(this.credentials).list();

    const eksPromises: Promise<PagingResponse<ResourceOutputs['kubernetesCluster']>>[] = [];
    for (const region of regions.rows) {
      eksPromises.push(
        new Promise<PagingResponse<ResourceOutputs['kubernetesCluster']>>(async (resolve, reject) => {
          const eksClustersData = await AwsUtils.getEKS(this.credentials, region.id).listClusters().promise();
          const clusters = eksClustersData.clusters || [];
          const clusterPromises = [];
          for (const clusterName of clusters) {
            clusterPromises.push(
              AwsUtils.getEKS(this.credentials, region.id)
                .describeCluster({
                  name: clusterName,
                })
                .promise(),
            );
          }

          const clusterResultsRequest = await Promise.all(clusterPromises);
          const clusterResults = clusterResultsRequest.filter((cluster) => {
            return cluster.cluster?.status === 'ACTIVE';
          });

          resolve({
            total: clusterResults.length,
            rows: clusterResults.map((clusterData) => ({
              id: `${region?.id}/${clusterData?.cluster?.name}`,
              vpc: clusterData.cluster?.resourcesVpcConfig?.vpcId || '',
              name: clusterData.cluster?.name || '',
              kubernetesVersion: clusterData.cluster?.version || '',
              account: '',
            })),
          });
        }),
      );
    }

    const responses = await Promise.all(eksPromises);

    return {
      total: responses.reduce((value, page) => {
        return value + page.total;
      }, 0),
      rows: responses.reduce((value, page) => {
        return [...value, ...page.rows];
      }, [] as ResourceOutputs['kubernetesCluster'][]),
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
              nodeSize: 't2.medium',
            },
          ],
        },
      },
      {
        display: 'Best Practice',
        values: {
          nodePools: [
            {
              name: 'nodepool1',
              count: 3,
              nodeSize: 't2.medium',
            },
          ],
        },
      },
    ];
  }

  construct = AwsKubernetesClusterModule;
}
