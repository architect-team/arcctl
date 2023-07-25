import { Construct } from 'constructs';
import { pg } from 'deps';
import { ResourceOutputs } from '../../../@resources/types.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ProviderStore } from '../../store.ts';
import { TerraformResourceService } from '../../terraform.service.ts';
import { PostgresqlProvider } from '../.gen/providers/postgresql/provider/index.ts';
import { PostgresCredentials } from '../credentials.ts';
import { PostgresDatabaseModule } from '../modules/database.ts';
import { getPgClient } from '../utils.ts';

export class PostgresDatabaseService extends TerraformResourceService<'database', PostgresCredentials> {
  private client: pg.Client;

  readonly terraform_version = '1.4.5';
  readonly construct = PostgresDatabaseModule;

  constructor(accountName: string, credentials: PostgresCredentials, providerStore: ProviderStore) {
    super(accountName, credentials, providerStore);

    this.client = getPgClient(credentials);
  }

  async get(id: string): Promise<ResourceOutputs['database'] | undefined> {
    const results = await this.list({ id });
    if (results.total > 0) {
      return results.rows[0];
    }

    return undefined;
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['database']>,
    _pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['database']>> {
    await this.client.connect();
    let query = 'SELECT datname FROM pg_database WHERE datistemplate = false';
    if (filterOptions?.name) {
      query += ` AND datname LIKE '%${filterOptions.id}%'`;
    }
    const res = await this.client.query(query);
    await this.client.end();

    return {
      total: res.rowCount,
      rows: res.rows.map((r: { datname: string }) => ({
        id: r.datname,
        account: '',
        host: this.credentials.host,
        port: this.credentials.port,
        name: r.datname,
        username: this.credentials.username,
        password: '',
        protocol: 'postgresql',
        url: `postgresql://${this.credentials.host}:${this.credentials.port}/${r.datname}`,
      })),
    };
  }

  configureTerraformProviders(scope: Construct): void {
    new PostgresqlProvider(scope, 'postgres', {
      host: this.credentials.host === 'host.docker.internal' ? 'localhost' : this.credentials.host,
      port: this.credentials.port,
      username: this.credentials.username,
      password: this.credentials.password,
      superuser: false,
      sslMode: 'disable',
    });
  }
}