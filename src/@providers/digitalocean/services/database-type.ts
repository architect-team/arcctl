import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ResourceService } from '../../base.service.ts';
import { ProviderStore } from '../../store.ts';
import { DigitaloceanCredentials } from '../credentials.ts';
import { digitalOceanApiRequest } from '../utils.ts';

export class DigitaloceanDatabaseTypeService extends ResourceService<'databaseType', DigitaloceanCredentials> {
  constructor(accountName: string, credentials: DigitaloceanCredentials, providerStore: ProviderStore) {
    super(accountName, credentials, providerStore);
  }

  get(_id: string): Promise<ResourceOutputs['databaseType'] | undefined> {
    return Promise.resolve(undefined);
  }

  // TODO: implement filter
  async list(
    _filterOptions?: Partial<ResourceOutputs['databaseType']>,
    _pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['databaseType']>> {
    const options = (await digitalOceanApiRequest({
      credentials: this.credentials,
      path: '/databases/options',
    })).options;
    const types: ResourceOutputs['databaseType'][] = [];
    for (const database_name of Object.keys(options)) {
      types.push({
        id: database_name,
      });
    }
    return {
      total: types.length,
      rows: types,
    };
  }
}
