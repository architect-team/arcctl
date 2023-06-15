import { createApiClient } from 'dots-wrapper';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ResourceService } from '../../base.service.ts';
import { ProviderStore } from '../../store.ts';
import { DigitaloceanCredentials } from '../credentials.ts';

export class DigitaloceanRegionService extends ResourceService<'region', DigitaloceanCredentials> {
  private client: ReturnType<typeof createApiClient>;

  constructor(accountName: string, credentials: DigitaloceanCredentials, providerStore: ProviderStore) {
    super(accountName, credentials, providerStore);
    this.client = createApiClient({ token: credentials.token });
  }

  async get(id: string): Promise<ResourceOutputs['region'] | undefined> {
    const {
      data: { regions },
    } = await this.client.region.listRegions({});
    const region = regions.find((r) => r.slug === id);
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
    const options = await this.client.kubernetes.listAvailableOptionsOfKubernetes();
    const regions = options.data.options.regions;
    return {
      total: regions.length,
      rows: regions.map((region) => ({
        id: region.slug,
        name: region.name,
        type: 'region',
      })),
    };
  }
}
