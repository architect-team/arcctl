import { Provider, ProviderResources } from '../provider.ts';
import { PostgresqlProvider } from './.gen/providers/postgresql/provider/index.ts';
import { PostgresCredentials, PostgresCredentialsSchema } from './credentials.ts';
import { PostgresDatabaseSchemaService } from './services/database-schema.ts';
import { PostgresDatabaseUserService } from './services/database-user.ts';
import { Construct } from 'constructs';
import { pg } from 'deps';

export default class PostgresProvider extends Provider<PostgresCredentials> {
  readonly type = 'postgres';
  readonly terraform_version = '1.4.6';

  static readonly CredentialsSchema = PostgresCredentialsSchema;

  readonly resources: ProviderResources = {
    databaseSchema: new PostgresDatabaseSchemaService(this.credentials),
    databaseUser: new PostgresDatabaseUserService(this.credentials),
  };

  public async testCredentials(): Promise<boolean> {
    try {
      const client = new pg.Client({
        host: this.credentials.host,
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

  public configureTerraformProviders(scope: Construct): void {
    new PostgresqlProvider(scope, 'postgres', {
      host: this.credentials.host,
      port: this.credentials.port,
      username: this.credentials.username,
      password: this.credentials.password,
      superuser: false,
    });
  }
}
