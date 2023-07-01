import { pg } from 'deps';
import { ResourceOutputs } from '../../../@resources/types.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ProviderStore } from '../../store.ts';
import { TerraformResourceService } from '../../terraform.service.ts';
import { PostgresCredentials } from '../credentials.ts';
import { PostgresDatabaseUserModule } from '../modules/database-user.ts';

export class PostgresDatabaseUserService extends TerraformResourceService<'databaseUser', PostgresCredentials> {
  private client: pg.Client;

  readonly terraform_version = '1.4.5';
  readonly construct = PostgresDatabaseUserModule;

  constructor(accountName: string, credentials: PostgresCredentials, providerStore: ProviderStore) {
    super(accountName, credentials, providerStore);

    this.client = new pg.Client({
      host: credentials.host === 'host.docker.internal' ? 'localhost' : credentials.host,
      port: credentials.port,
      user: credentials.username,
      password: credentials.password,
      database: credentials.database,
    });
  }

  async get(id: string): Promise<ResourceOutputs['databaseUser'] | undefined> {
    const results = await this.list({ id });
    if (results.total > 0) {
      return results.rows[0];
    }

    return undefined;
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['databaseUser']>,
    _pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['databaseUser']>> {
    await this.client.connect();
    let query = `SELECT usename FROM pg_catalog.pg_user`;
    if (filterOptions?.id) {
      query += ` WHERE usename LIKE '%${filterOptions.id}%'`;
    }
    query += ' ORDER BY usename DESC';
    const res = await this.client.query(query);
    await this.client.end();

    return {
      total: res.rowCount,
      rows: res.rows.map((r: { usename: string }) => ({
        id: r.usename,
        username: r.usename,
        password: '',
        database: '',
        protocol: 'postgresql',
        host: this.credentials.host,
        port: this.credentials.port,
        url: `postgresql://${this.credentials.host}:${this.credentials.port}`,
      })),
    };
  }
}
