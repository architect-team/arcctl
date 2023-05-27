import { ResourceOutputs } from '../../../@resources/index.js';
import { PagingOptions, PagingResponse } from '../../../utils/paging.js';
import { BaseService } from '../../service.js';
import { DigitaloceanCredentials } from '../credentials.js';
import { createApiClient } from 'dots-wrapper';

export class DigitaloceanRegionService extends BaseService<'region'> {
  private client: ReturnType<typeof createApiClient>;

  constructor(credentials: DigitaloceanCredentials) {
    super();
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
    filterOptions?: Partial<ResourceOutputs['region']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['region']>> {
    const options =
      await this.client.kubernetes.listAvailableOptionsOfKubernetes();
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
