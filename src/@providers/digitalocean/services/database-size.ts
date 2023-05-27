import { ResourceOutputs } from '../../../@resources/index.js';
import { PagingOptions, PagingResponse } from '../../../utils/paging.js';
import { BaseService } from '../../service.js';
import { DigitaloceanCredentials } from '../credentials.js';
import { createApiClient } from 'dots-wrapper';

export class DigitaloceanDatabaseSizeService extends BaseService<'databaseSize'> {
  private client: ReturnType<typeof createApiClient>;

  constructor(credentials: DigitaloceanCredentials) {
    super();
    this.client = createApiClient({ token: credentials.token });
  }

  async get(id: string): Promise<ResourceOutputs['databaseSize'] | undefined> {
    return undefined;
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['databaseSize']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['databaseSize']>> {
    const {
      data: { options },
    } = await this.client.database.listDatabaseOptions();
    const results: ResourceOutputs['databaseSize'][] = [];
    const included_sizes: string[] = [];
    for (const [engine, engine_options] of Object.entries(options)) {
      if (
        filterOptions?.databaseType &&
        engine.toLowerCase() !== filterOptions?.databaseType.toLowerCase()
      ) {
        continue;
      }
      if (
        filterOptions?.databaseVersion &&
        !engine_options.versions?.includes(filterOptions?.databaseVersion)
      ) {
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
