import { pg } from 'deps';
import { Provider, ProviderResources } from '../provider.ts';
import { PostgresCredentials, PostgresCredentialsSchema } from './credentials.ts';
import { PostgresDatabaseSchemaService } from './services/database-schema.ts';
import { PostgresDatabaseUserService } from './services/database-user.ts';

export default class PostgresProvider extends Provider<PostgresCredentials> {
  readonly type = 'postgres';

  static readonly CredentialsSchema = PostgresCredentialsSchema;

  readonly resources: ProviderResources<PostgresCredentials> = {
    databaseSchema: new PostgresDatabaseSchemaService(this.name, this.credentials, this.providerStore),
    databaseUser: new PostgresDatabaseUserService(this.name, this.credentials, this.providerStore),
  };

  public async testCredentials(): Promise<boolean> {
    try {
      const client = new pg.Client({
        host: this.credentials.host === 'host.docker.internal' ? 'localhost' : this.credentials.host,
        port: this.credentials.port,
        user: this.credentials.username,
        password: this.credentials.password,
        database: this.credentials.database,
      });

      await client.connect();
      await client.query('SELECT NOW()');
      await client.end();

      return true;
    } catch {
      return false;
    }
  }
}
