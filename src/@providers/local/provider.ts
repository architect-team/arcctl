import { Construct } from 'constructs';
import { exists } from 'std/fs/exists.ts';
import { Provider, ProviderResources } from '../provider.ts';
import { LocalCredentials, LocalCredentialsSchema } from './credentials.ts';
import { LocalNamespaceService } from './services/namespace.ts';
import { LocalSecretService } from './services/secret.ts';

export default class LocalProvider extends Provider<LocalCredentials> {
  readonly type = 'local';
  readonly terraform_version = '1.4.6';

  static readonly CredentialsSchema = LocalCredentialsSchema;

  resources: ProviderResources = {
    secret: new LocalSecretService(this.credentials),
    namespace: new LocalNamespaceService(this.credentials),
  };

  public testCredentials(): Promise<boolean> {
    return exists(this.credentials.directory);
  }

  configureTerraformProviders(scope: Construct): void {}
}
