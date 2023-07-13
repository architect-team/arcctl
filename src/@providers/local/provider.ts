import { exists } from 'std/fs/exists.ts';
import { Provider } from '../provider.ts';
import { LocalCredentials, LocalCredentialsSchema } from './credentials.ts';
import { LocalNamespaceService } from './services/namespace.ts';
import { LocalSecretService } from './services/secret.ts';

export default class LocalProvider extends Provider<LocalCredentials> {
  readonly type = 'local';

  static readonly CredentialsSchema = LocalCredentialsSchema;

  resources = {
    secret: new LocalSecretService(this.name, this.credentials, this.providerStore),
    namespace: new LocalNamespaceService(this.name, this.credentials, this.providerStore),
  };

  public testCredentials(): Promise<boolean> {
    return exists(this.credentials.directory); // TODO: this should be more specific and let the user know that the directory doesn't exist
    // TODO: why doesn't this pass with ~/.arcctl?
  }
}
