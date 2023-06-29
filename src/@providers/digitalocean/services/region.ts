import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ResourceService } from '../../base.service.ts';
import { ProviderStore } from '../../store.ts';
import { DigitaloceanCredentials } from '../credentials.ts';
import { digitalOceanApiRequest } from '../utils.ts';

export class DigitaloceanRegionService extends ResourceService<'region', DigitaloceanCredentials> {
  constructor(accountName: string, credentials: DigitaloceanCredentials, providerStore: ProviderStore) {
    super(accountName, credentials, providerStore);
  }

  async get(id: string): Promise<ResourceOutputs['region'] | undefined> {
    const regions = (await digitalOceanApiRequest({
      credentials: this.credentials,
      path: '/regions',
    })).regions;
    const region = regions.find((r: any) => r.slug === id);
    return region
      ? {
        id: region.slug,
        name: region.name,
      }
      : undefined;
  }

  // TODO: implement filter
  async list(
    _filterOptions?: Partial<ResourceOutputs['region']>,
    _pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['region']>> {
    const options = (await digitalOceanApiRequest({
      credentials: this.credentials,
      path: '/kubernetes/options',
    })).options;
    const regions = options.regions;
    return {
      total: regions.length,
      rows: regions.map((region: any) => ({
        id: region.slug,
        name: region.name,
        type: 'region',
      })),
    };
  }
}
