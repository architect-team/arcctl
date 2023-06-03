import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ResourceService } from '../../base.service.ts';
import { DigitaloceanCredentials } from '../credentials.ts';
import { createApiClient } from 'dots-wrapper';

export class DigitaloceanDatabaseTypeService extends ResourceService<'databaseType', DigitaloceanCredentials> {
  private client: ReturnType<typeof createApiClient>;

  constructor(credentials: DigitaloceanCredentials) {
    super(credentials);
    this.client = createApiClient({ token: credentials.token });
  }

  get(_id: string): Promise<ResourceOutputs['databaseType'] | undefined> {
    return Promise.resolve(undefined);
  }

  // TODO: implement filter
  async list(
    _filterOptions?: Partial<ResourceOutputs['databaseType']>,
    _pagingOptions?: Partial<PagingOptions>,
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
