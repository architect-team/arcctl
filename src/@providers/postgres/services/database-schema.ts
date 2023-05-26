import { ResourceOutputs } from '../../../@resources/types.js';
import { PagingOptions, PagingResponse } from '../../../utils/paging.js';
import { TerraformResourceService } from '../../terraform.service.js';
import { PostgresCredentials } from '../credentials.js';
import { PostgresDatabaseSchemaModule } from '../modules/database-schema.js';
import pg from 'pg';

export class PostgresDatabaseSchemaService extends TerraformResourceService<
  'databaseSchema',
  PostgresCredentials
> {
  client: pg.Client;

  constructor(private credentials: PostgresCredentials) {
    super();

    this.client = new pg.Client({
      host: credentials.host,
      port: credentials.port,
      user: credentials.username,
      password: credentials.password,
      database: credentials.database,
    });
  }

  async get(
    id: string,
  ): Promise<ResourceOutputs['databaseSchema'] | undefined> {
    const results = await this.list({ id });
    if (results.total > 0) {
      return results.rows[0];
    }

    return undefined;
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['databaseSchema']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['databaseSchema']>> {
    await this.client.connect();
    let query = 'SELECT datname FROM pg_database WHERE datistemplate = false';
    if (filterOptions?.name) {
      query += ` AND datname LIKE '%${filterOptions.id}%'`;
    }
    const res = await this.client.query(query);
    await this.client.end();

    return {
      total: res.rowCount,
      rows: res.rows.map((r) => ({
        id: r.datname,
        account: '',
        host: this.credentials.host,
        port: this.credentials.port,
        name: r.datname,
        protocol: 'postgresql',
        url: `postgresql://${this.credentials.host}:${this.credentials.port}/${r.datname}`,
      })),
    };
  }

  construct = PostgresDatabaseSchemaModule;
}
