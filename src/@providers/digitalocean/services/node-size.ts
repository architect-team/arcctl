import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ResourceService } from '../../base.service.ts';
import { ProviderStore } from '../../store.ts';
import { DigitaloceanCredentials } from '../credentials.ts';
import { digitalOceanApiRequest } from '../utils.ts';

export class DigitaloceanNodeSizeService extends ResourceService<'nodeSize', DigitaloceanCredentials> {
  constructor(accountName: string, credentials: DigitaloceanCredentials, providerStore: ProviderStore) {
    super(accountName, credentials, providerStore);
  }

  async get(id: string): Promise<ResourceOutputs['nodeSize'] | undefined> {
    const options = (await digitalOceanApiRequest({
      credentials: this.credentials,
      path: '/kubernetes/options',
    })).options;
    const match = options.sizes.find((size: any) => size.slug === id);
    return match
      ? {
        id: match.slug,
      }
      : undefined;
  }

  // TODO: implement filter
  async list(
    _filterOptions?: Partial<ResourceOutputs['nodeSize']>,
    _pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['nodeSize']>> {
    const options = (await digitalOceanApiRequest({
      credentials: this.credentials,
      path: '/kubernetes/options',
    })).options;
    return {
      total: options.sizes.length,
      rows: options.sizes.map((size: any) => ({
        type: 'nodeSize',
        id: size.slug,
        name: size.name,
      })),
    };
  }
}
