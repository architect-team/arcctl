import { Construct } from 'constructs';
import { ResourceOutputs } from '../../../@resources/types.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ProviderStore } from '../../store.ts';
import { TerraformResourceService } from '../../terraform.service.ts';
import { DigitaloceanProvider as TerraformDigitaloceanProvider } from '../.gen/providers/digitalocean/provider/index.ts';
import { DigitaloceanCredentials } from '../credentials.ts';
import { DigitaloceanDatabaseSchemaModule } from '../modules/database-schema.ts';
import { digitalOceanApiRequest } from '../utils.ts';

export class DigitaloceanDatabaseSchemaService extends TerraformResourceService<
  'databaseSchema',
  DigitaloceanCredentials
> {
  readonly terraform_version = '1.4.5';
  readonly construct = DigitaloceanDatabaseSchemaModule;

  constructor(accountName: string, credentials: DigitaloceanCredentials, providerStore: ProviderStore) {
    super(accountName, credentials, providerStore);
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
    const cluster = await digitalOceanApiRequest({
      credentials: this.credentials,
      path: `/databases/${cluster_id}`,
    });
    const res = await digitalOceanApiRequest({
      credentials: this.credentials,
      path: `/databases/${cluster_id}/dbs/${db}`,
    });
    const protocol = cluster.database.engine === 'pg' ? 'postgresql' : cluster.database.engine;
    const username = cluster.database.connection.user;
    const password = '';
    const host = cluster.database.connection.host;
    const port = cluster.database.connection.port;

    return {
      id: `${cluster_id}/${res.db.name}`,
      protocol,
      username,
      password,
      host,
      port,
      account: this.accountName,
      name: res.db.name,
      url: `${protocol}://${username}:${password}@${host}:${port}/${res.db.name}`,
    };
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['databaseSchema']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['databaseSchema']>> {
    const clusters = await digitalOceanApiRequest({
      credentials: this.credentials,
      path: '/databases',
    });
    const schemas: ResourceOutputs['databaseSchema'][] = [];
    await Promise.all(
      (clusters.databases || []).map(async (cluster: any) => {
        const res = await digitalOceanApiRequest({
          credentials: this.credentials,
          path: `/databases/${cluster.id}/dbs`,
        });
        res.dbs.forEach((db: any) => {
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
