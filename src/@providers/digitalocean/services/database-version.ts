import { createApiClient } from 'dots-wrapper';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ResourceService } from '../../base.service.ts';
import { ProviderStore } from '../../store.ts';
import { DigitaloceanCredentials } from '../credentials.ts';

export class DigitaloceanDatabaseVersionService extends ResourceService<'databaseVersion', DigitaloceanCredentials> {
  private client: ReturnType<typeof createApiClient>;

  constructor(accountName: string, credentials: DigitaloceanCredentials, providerStore: ProviderStore) {
    super(accountName, credentials, providerStore);
    this.client = createApiClient({ token: credentials.token });
  }

  get(_id: string): Promise<ResourceOutputs['databaseVersion'] | undefined> {
    return Promise.resolve(undefined);
  }

  // TODO: implement filter
  async list(
    filterOptions?: Partial<ResourceOutputs['databaseVersion']>,
    _pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['databaseVersion']>> {
    const {
      data: { options },
    } = await this.client.database.listDatabaseOptions();
    const versions: ResourceOutputs['databaseVersion'][] = [];
    for (const [database_name, database_options] of Object.entries(options)) {
      if (filterOptions?.databaseType && database_name.toLowerCase() !== filterOptions.databaseType) {
        continue;
      }
      for (const version of database_options.versions) {
        versions.push({
          id: version,
          databaseType: database_name,
          databaseVersion: version,
        });
      }
    }
    return {
      total: versions.length,
      rows: versions,
    };
  }
}
