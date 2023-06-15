import { Construct } from 'constructs';
import { createApiClient } from 'dots-wrapper';
import { ResourceOutputs } from '../../../@resources/types.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ProviderStore } from '../../store.ts';
import { TerraformResourceService } from '../../terraform.service.ts';
import { DigitaloceanProvider as TerraformDigitaloceanProvider } from '../.gen/providers/digitalocean/provider/index.ts';
import { DigitaloceanCredentials } from '../credentials.ts';
import { DigitaloceanDatabaseUserModule } from '../modules/database-user.ts';

export class DigitaloceanDatabaseUserService extends TerraformResourceService<'databaseUser', DigitaloceanCredentials> {
  private client: ReturnType<typeof createApiClient>;

  readonly terraform_version = '1.4.5';
  readonly construct = DigitaloceanDatabaseUserModule;

  constructor(accountName: string, credentials: DigitaloceanCredentials, providerStore: ProviderStore) {
    super(accountName, credentials, providerStore);
    this.client = createApiClient({ token: credentials.token });
  }

  public configureTerraformProviders(scope: Construct): TerraformDigitaloceanProvider {
    return new TerraformDigitaloceanProvider(scope, 'digitalocean', {
      token: this.credentials.token,
    });
  }

  async get(id: string): Promise<ResourceOutputs['databaseUser'] | undefined> {
    if (!id.includes('/')) {
      throw new Error(`ID must be of the format: <database>/<user>. Got: ${id}`);
    }

    const [cluster_id, user] = id.split('/');
    const cluster = await this.client.database.getDatabaseCluster({ database_cluster_id: cluster_id });
    const res = await this.client.database.getDatabaseClusterUser({
      database_cluster_id: cluster.data.database.id,
      user_name: user,
    });
    const protocol = cluster.data.database.engine === 'pg' ? 'postgresql' : cluster.data.database.engine;
    const username = res.data.user.name;
    const password = '';
    const host = cluster.data.database.connection.host;
    const port = cluster.data.database.connection.port;

    return {
      id: `${cluster_id}/${res.data.user.name}`,
      protocol,
      username,
      password,
      host,
      port,
      database: cluster.data.database.connection.database,
      url: `${protocol}://${username}:${password}@${host}:${port}/${cluster.data.database.connection.database}`,
    };
  }

  async list(
    _filterOptions?: Partial<ResourceOutputs['databaseUser']>,
    _pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['databaseUser']>> {
    const clusters = await this.client.database.listDatabaseClusters({ per_page: 100 });
    const users: ResourceOutputs['databaseUser'][] = [];
    await Promise.all(
      clusters.data.databases.map(async (cluster) => {
        const res = await this.client.database.listDatabaseClusterUsers({
          database_cluster_id: cluster.id,
        });

        res.data.users.forEach((user) => {
          const protocol = cluster.engine === 'pg' ? 'postgresql' : cluster.engine;
          const host = cluster.connection.host;
          const port = cluster.connection.port;
          const username = user.name;
          const password = '';

          users.push({
            id: `${cluster.id}/${user.name}`,
            host,
            port,
            username,
            password,
            protocol,
            database: cluster.connection.database,
            url: `${protocol}://${username}:${password}@${host}:${port}/${cluster.connection.database}`,
          });
        });
      }),
    );

    return {
      total: users.length,
      rows: users,
    };
  }
}
