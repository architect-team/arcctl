import { Provider } from '../provider.ts';
import { TraefikCredentials, TraefikCredentialsSchema } from './credentials.ts';
import { TraefikIngressRuleService } from './services/ingress-rule.ts';
import { TraefikNamespaceService } from './services/namespace.ts';
import { TraefikServiceService } from './services/service.ts';

export default class TraefikProvider extends Provider<TraefikCredentials> {
  readonly type = 'traefik';

  static readonly CredentialsSchema = TraefikCredentialsSchema;

  resources = {
    service: new TraefikServiceService(this.name, this.credentials, this.providerStore),
    ingressRule: new TraefikIngressRuleService(this.name, this.credentials, this.providerStore),
    namespace: new TraefikNamespaceService(this.name, this.credentials, this.providerStore),
  };

  public async testCredentials(): Promise<boolean> {
    switch (this.credentials.type) {
      case 'volume': {
        const account = this.providerStore.get(this.credentials.account);
        if (!account) {
          return false;
        } else if (!account.resources.task || !('apply' in account.resources.task)) {
          return false;
        } else if (!account.resources.volume) {
          return false;
        }

        const volume = await account.resources.volume.get(this.credentials.volume);
        return Boolean(volume);
      }
    }
  }
}
