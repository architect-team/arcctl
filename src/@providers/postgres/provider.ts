import { Provider, ProviderResources } from '../provider.js';
import { PostgresqlProvider } from './.gen/providers/postgresql/provider/index.js';
import {
  PostgresCredentials,
  PostgresCredentialsSchema,
} from './credentials.js';
import { PostgresDatabaseSchemaService } from './services/database-schema.js';
import { PostgresDatabaseUserService } from './services/database-user.js';
import { Construct } from 'constructs';

export default class PostgresProvider extends Provider<PostgresCredentials> {
  readonly type = 'postgres';
  readonly terraform_version = '1.4.6';

  static readonly CredentialsSchema = PostgresCredentialsSchema;

  readonly resources: ProviderResources = {
    databaseSchema: new PostgresDatabaseSchemaService(this.credentials),
    databaseUser: new PostgresDatabaseUserService(this.credentials),
  };

  public async testCredentials(): Promise<boolean> {
    return true;
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
