import { Construct } from 'constructs';
import { createApiClient } from 'dots-wrapper';
import { ResourceOutputs } from '../../../@resources/types.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ProviderStore } from '../../store.ts';
import { TerraformResourceService } from '../../terraform.service.ts';
import { DigitaloceanProvider as TerraformDigitaloceanProvider } from '../.gen/providers/digitalocean/provider/index.ts';
import { DigitaloceanCredentials } from '../credentials.ts';
import { DigitaloceanDatabaseSchemaModule } from '../modules/database-schema.ts';

export class DigitaloceanDatabaseSchemaService extends TerraformResourceService<
  'databaseSchema',
  DigitaloceanCredentials
> {
  private client: ReturnType<typeof createApiClient>;

  readonly terraform_version = '1.4.5';
  readonly construct = DigitaloceanDatabaseSchemaModule;

  constructor(accountName: string, credentials: DigitaloceanCredentials, providerStore: ProviderStore) {
    super(accountName, credentials, providerStore);
    this.client = createApiClient({ token: credentials.token });
  }

  public configureTerraformProviders(scope: Construct): TerraformDigitaloceanProvider {
    return new TerraformDigitaloceanProvider(scope, 'digitalocean', {
      token: this.credentials.token,
    });
  }

  async get(id: string): Promise<ResourceOutputs['databaseSchema'] | undefined> {
    if (!id.includes('/')) {
      throw new Error(`ID must be of the format: <database>/<schema>. Got: ${id}`);
    }

    const [cluster_id, db] = id.split('/');
    const cluster = await this.client.database.getDatabaseCluster({ database_cluster_id: cluster_id });
    const res = await this.client.database.getDatabaseClusterDb({
      database_cluster_id: cluster.data.database.id,
      db_name: db,
    });
    const protocol = cluster.data.database.engine === 'pg' ? 'postgresql' : cluster.data.database.engine;
    const username = cluster.data.database.connection.user;
    const password = '';
    const host = cluster.data.database.connection.host;
    const port = cluster.data.database.connection.port;

    return {
      id: `${cluster_id}/${res.data.db.name}`,
      protocol,
      username,
      password,
      host,
      port,
      account: this.accountName,
      name: res.data.db.name,
      url: `${protocol}://${username}:${password}@${host}:${port}/${res.data.db.name}`,
    };
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['databaseSchema']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['databaseSchema']>> {
    const clusters = await this.client.database.listDatabaseClusters({ per_page: 100 });
    const schemas: ResourceOutputs['databaseSchema'][] = [];
    await Promise.all(
      clusters.data.databases.map(async (cluster) => {
        const res = await this.client.database.listDatabaseClusterDbs({
          database_cluster_id: cluster.id,
        });

        res.data.dbs.forEach((db) => {
          const protocol = cluster.engine === 'pg' ? 'postgresql' : cluster.engine;
          const host = cluster.connection.host;
          const port = cluster.connection.port;
          const username = cluster.connection.user;
          const password = '';

          schemas.push({
            id: `${cluster.id}/${db.name}`,
            account: this.accountName,
            host,
            port,
            username,
            password,
            protocol,
            name: db.name,
            url: `${protocol}://${username}:${password}@${host}:${port}/${db.name}`,
          });
        });
      }),
    );

    return {
      total: schemas.length,
      rows: schemas,
    };
  }
}
