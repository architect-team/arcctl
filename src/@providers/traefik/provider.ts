import { Provider } from '../provider.ts';
import { TraefikCredentials, TraefikCredentialsSchema } from './credentials.ts';
import { TraefikServiceService } from './services/service.ts';

export default class TraefikProvider extends Provider<TraefikCredentials> {
  readonly type = 'traefik';

  static readonly CredentialsSchema = TraefikCredentialsSchema;

  resources = {
    service: new TraefikServiceService(this.name, this.credentials, this.providerStore),
  };

  public testCredentials(): Promise<boolean> {
    switch (this.credentials.type) {
      case 'volume': {
        const account = this.providerStore.getProvider(this.credentials.account);
        if (!account) {
          return Promise.resolve(false);
        } else if (!account.resources.task || !('apply' in account.resources.task)) {
          return Promise.resolve(false);
        }

        return Promise.resolve(true);
      }
    }
  }
}
