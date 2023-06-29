import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ResourceService } from '../../base.service.ts';
import { ProviderStore } from '../../store.ts';
import { DigitaloceanCredentials } from '../credentials.ts';
import { digitalOceanApiRequest } from '../utils.ts';

export class DigitaloceanDatabaseSizeService extends ResourceService<'databaseSize', DigitaloceanCredentials> {
  constructor(accountName: string, credentials: DigitaloceanCredentials, providerStore: ProviderStore) {
    super(accountName, credentials, providerStore);
  }

  get(_id: string): Promise<ResourceOutputs['databaseSize'] | undefined> {
    return Promise.resolve(undefined);
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['databaseSize']>,
    _pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['databaseSize']>> {
    const options = (await digitalOceanApiRequest({
      credentials: this.credentials,
      path: '/databases/options',
    })).options;
    const results: ResourceOutputs['databaseSize'][] = [];
    const included_sizes: string[] = [];
    const entries = Object.entries(options) as [string, any][];
    for (
      const [engine, engine_options] of entries
    ) {
      if (filterOptions?.databaseType && engine.toLowerCase() !== filterOptions?.databaseType.toLowerCase()) {
        continue;
      }
      if (filterOptions?.databaseVersion && !engine_options.versions?.includes(filterOptions?.databaseVersion)) {
        continue;
      }
      for (const layout of engine_options.layouts) {
        for (const size of layout.sizes) {
          if (included_sizes.includes(size)) {
            continue;
          }
          included_sizes.push(size);
          results.push({
            id: size,
            databaseType: filterOptions?.databaseType || '',
            databaseVersion: filterOptions?.databaseVersion || '',
          });
        }
      }
    }
    return {
      total: results.length,
      rows: results,
    };
  }
}
