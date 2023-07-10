import { Provider, ProviderResources } from '../provider.ts';
import { PostgresCredentials, PostgresCredentialsSchema } from './credentials.ts';
import { PostgresDatabaseSchemaService } from './services/database-schema.ts';
import { PostgresDatabaseUserService } from './services/database-user.ts';
import { getPgClient } from './utils.ts';

export default class PostgresProvider extends Provider<PostgresCredentials> {
  readonly type = 'postgres';

  static readonly CredentialsSchema = PostgresCredentialsSchema;

  readonly resources: ProviderResources<PostgresCredentials> = {
    databaseSchema: new PostgresDatabaseSchemaService(this.name, this.credentials, this.providerStore),
    databaseUser: new PostgresDatabaseUserService(this.name, this.credentials, this.providerStore),
  };

  public async testCredentials(): Promise<boolean> {
    let failureCount = 0;
    while (failureCount < 3) {
      try {
        const client = getPgClient(this.credentials);

        await client.connect();
        await client.query('SELECT NOW()');
        await client.end();

        return true;
      } catch {
        failureCount++;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000 * failureCount));
    }
    return false;
  }
}
