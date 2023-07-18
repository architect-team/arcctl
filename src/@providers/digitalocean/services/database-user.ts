import { Construct } from 'constructs';
import { ResourceOutputs } from '../../../@resources/types.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ProviderStore } from '../../store.ts';
import { TerraformResourceService } from '../../terraform.service.ts';
import { DigitaloceanProvider as TerraformDigitaloceanProvider } from '../.gen/providers/digitalocean/provider/index.ts';
import { DigitaloceanCredentials } from '../credentials.ts';
import { DigitaloceanDatabaseUserModule } from '../modules/database-user.ts';
import { digitalOceanApiRequest } from '../utils.ts';

export class DigitaloceanDatabaseUserService extends TerraformResourceService<'databaseUser', DigitaloceanCredentials> {
  readonly terraform_version = '1.4.5';
  readonly construct = DigitaloceanDatabaseUserModule;

  constructor(accountName: string, credentials: DigitaloceanCredentials, providerStore: ProviderStore) {
    super(accountName, credentials, providerStore);
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
    const cluster = await digitalOceanApiRequest({
      credentials: this.credentials,
      path: `/databases/${cluster_id}`,
    });
    const res = await digitalOceanApiRequest({
      credentials: this.credentials,
      path: `/databases/${cluster.database.id}/users/${user}`,
    });
    const protocol = cluster.database.engine === 'pg' ? 'postgresql' : cluster.database.engine;
    const username = res.user.name;
    const password = '';
    const host = cluster.database.connection.host;
    const port = cluster.database.connection.port;

    return {
      id: `${cluster_id}/${res.user.name}`,
      protocol,
      username,
      password,
      host,
      port,
      database: cluster.database.connection.database,
      url: `${protocol}://${username}:${password}@${host}:${port}/${cluster.database.connection.database}`,
    };
  }

  async list(
    _filterOptions?: Partial<ResourceOutputs['databaseUser']>,
    _pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['databaseUser']>> {
    const clusters = await digitalOceanApiRequest({
      credentials: this.credentials,
      path: '/databases',
    });
    const users: ResourceOutputs['databaseUser'][] = [];
    await Promise.all(
      clusters.databases.map(async (cluster: any) => {
        const res = await digitalOceanApiRequest({
          credentials: this.credentials,
          path: `/databases/${cluster.id}/users`,
        });

        res.users.forEach((user: any) => {
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
