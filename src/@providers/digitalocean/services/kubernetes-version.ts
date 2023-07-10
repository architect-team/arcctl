import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ResourceService } from '../../base.service.ts';
import { ProviderStore } from '../../store.ts';
import { DigitaloceanCredentials } from '../credentials.ts';
import { digitalOceanApiRequest } from '../utils.ts';

export class DigitaloceanKubernetesVersionService extends ResourceService<
  'kubernetesVersion',
  DigitaloceanCredentials
> {
  constructor(accountName: string, credentials: DigitaloceanCredentials, providerStore: ProviderStore) {
    super(accountName, credentials, providerStore);
  }

  async get(id: string): Promise<ResourceOutputs['kubernetesVersion'] | undefined> {
    const options = (await digitalOceanApiRequest({
      credentials: this.credentials,
      path: '/kubernetes/options',
    })).options;
    const match = options.versions.find((version: any) => version.slug === id);

    return match
      ? {
        id: match.slug,
        name: match.kubernetes_version,
      }
      : undefined;
  }

  // TODO: implement filter
  async list(
    _filterOptions?: Partial<ResourceOutputs['kubernetesVersion']>,
    _pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['kubernetesVersion']>> {
    const options = (await digitalOceanApiRequest({
      credentials: this.credentials,
      path: '/kubernetes/options',
    })).options;

    return {
      total: options.versions.length,
      rows: options.versions.map((version: any) => ({
        type: 'kubernetesVersion',
        id: version.slug,
        name: version.kubernetes_version,
      })),
    };
  }
}
