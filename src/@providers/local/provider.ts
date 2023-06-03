import { Provider, ProviderResources } from '../provider.ts';
import { LocalCredentials, LocalCredentialsSchema } from './credentials.ts';
import { LocalNamespaceService } from './services/namespace.ts';
import { LocalSecretService } from './services/secret.ts';
import { exists } from 'std/fs/exists.ts';

export default class LocalProvider extends Provider<LocalCredentials> {
  readonly type = 'local';

  static readonly CredentialsSchema = LocalCredentialsSchema;

  resources: ProviderResources<LocalCredentials> = {
    secret: new LocalSecretService(this.credentials),
    namespace: new LocalNamespaceService(this.credentials),
  };

  public testCredentials(): Promise<boolean> {
    return exists(this.credentials.directory);
  }
}
