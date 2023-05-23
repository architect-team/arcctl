import { ResourceOutputs } from '../../../@resources/index.js';
import { PagingOptions, PagingResponse } from '../../../utils/paging.js';
import { ReadOnlyResourceService } from '../../service.js';
import { DigitaloceanCredentials } from '../credentials.js';
import { createApiClient } from 'dots-wrapper';

export class DigitaloceanDatabaseTypeService extends ReadOnlyResourceService<'databaseType'> {
  private client: ReturnType<typeof createApiClient>;

  constructor(credentials: DigitaloceanCredentials) {
    super();
    this.client = createApiClient({ token: credentials.token });
  }

  async get(id: string): Promise<ResourceOutputs['databaseType'] | undefined> {
    return undefined;
  }

  // TODO: implement filter
  async list(
    filterOptions?: Partial<ResourceOutputs['databaseType']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['databaseType']>> {
    const {
      data: { options },
    } = await this.client.database.listDatabaseOptions();
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
