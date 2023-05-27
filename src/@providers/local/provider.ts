import { Provider, ProviderResources } from '../provider.js';
import { LocalCredentials, LocalCredentialsSchema } from './credentials.js';
import { LocalNamespaceService } from './services/namespace.js';
import { LocalSecretService } from './services/secret.js';
import { Construct } from 'constructs';
import fs from 'fs';

export default class LocalProvider extends Provider<LocalCredentials> {
  readonly type = 'local';
  readonly terraform_version = '1.4.6';

  static readonly CredentialsSchema = LocalCredentialsSchema;

  resources: ProviderResources = {
    secret: new LocalSecretService(this.credentials),
    namespace: new LocalNamespaceService(this.credentials),
  };

  public async testCredentials(): Promise<boolean> {
    return fs.existsSync(this.credentials.directory);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  configureTerraformProviders(scope: Construct): void {}
}
