import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ResourceService } from '../../service.ts';
import { DigitaloceanCredentials } from '../credentials.ts';
import { createApiClient } from 'dots-wrapper';

export class DigitaloceanDatabaseVersionService extends ResourceService<
  'databaseVersion',
  DigitaloceanCredentials
> {
  private client: ReturnType<typeof createApiClient>;

  constructor(credentials: DigitaloceanCredentials) {
    super();
    this.client = createApiClient({ token: credentials.token });
  }

  async get(
    id: string,
  ): Promise<ResourceOutputs['databaseVersion'] | undefined> {
    return undefined;
  }

  // TODO: implement filter
  async list(
    filterOptions?: Partial<ResourceOutputs['databaseVersion']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['databaseVersion']>> {
    const {
      data: { options },
    } = await this.client.database.listDatabaseOptions();
    const versions: ResourceOutputs['databaseVersion'][] = [];
    for (const [database_name, database_options] of Object.entries(options)) {
      if (database_name.toLowerCase() !== filterOptions?.databaseType) {
        continue;
      }
      for (const version of database_options.versions) {
        versions.push({
          id: version,
          databaseType: database_name,
        });
      }
    }
    return {
      total: versions.length,
      rows: versions,
    };
  }
}
