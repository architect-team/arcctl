import { ResourceOutputs } from '../../../@resources/index.js';
import { PagingOptions, PagingResponse } from '../../../utils/paging.js';
import { ResourceService } from '../../service.js';
import { DigitaloceanCredentials } from '../credentials.js';
import { DigitaloceanDatabaseModule } from '../modules/database.js';
import { createApiClient } from 'dots-wrapper';
import { IDatabaseCluster } from 'dots-wrapper/dist/database/index.js';

export class DigitaloceanDatabaseService extends ResourceService<
  'database',
  DigitaloceanCredentials
> {
  private client: ReturnType<typeof createApiClient>;

  constructor(credentials: DigitaloceanCredentials) {
    super();
    this.client = createApiClient({ token: credentials.token });
  }

  private normalizeDatabase(
    database: IDatabaseCluster,
  ): ResourceOutputs['database'] {
    return {
      id: database.id,
      host: database.connection.host,
      port: database.connection.port,
      provider: '',
      protocol: database.engine === 'pg' ? 'postgresql' : database.engine,
    };
  }

  async get(id: string): Promise<ResourceOutputs['database'] | undefined> {
    const {
      data: { database },
    } = await this.client.database.getDatabaseCluster({
      database_cluster_id: id,
    });
    return this.normalizeDatabase(database);
  }

  // TODO: implement filter
  async list(
    filterOptions?: Partial<ResourceOutputs['database']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['database']>> {
    const {
      data: { databases },
    } = await this.client.database.listDatabaseClusters({});
    return {
      total: databases.length,
      rows: databases.map((element) => this.normalizeDatabase(element)),
    };
  }

  manage = {
    presets: [
      {
        display: 'Development',
        values: {
          databaseType: 'pg',
          databaseVersion: '14',
          databaseSize: 'db-s-1vcpu-1gb',
        },
      },
    ],

    module: DigitaloceanDatabaseModule,
  };
}
