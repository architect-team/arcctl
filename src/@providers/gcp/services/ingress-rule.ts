import { Auth, google } from 'googleapis';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ProviderStore } from '../../store.ts';
import { TerraformResourceService } from '../../terraform.service.ts';
import { GoogleCloudCredentials } from '../credentials.ts';
import { GoogleCloudIngressRuleModule } from '../modules/ingress-rule.ts';

export class GoogleCloudIngressRuleService extends TerraformResourceService<'ingressRule', GoogleCloudCredentials> {
  private auth: Auth.GoogleAuth;

  readonly terraform_version = '1.4.5';
  readonly construct = GoogleCloudIngressRuleModule;

  constructor(accountName: string, credentials: GoogleCloudCredentials, providerStore: ProviderStore) {
    super(accountName, credentials, providerStore);
    this.auth = new Auth.GoogleAuth({
      keyFile: credentials.serviceAccountCredentialsFile,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
  }

  async get(
    id: string,
  ): Promise<ResourceOutputs['ingressRule'] | undefined> {
    try {
      const { data: rule } = await google.compute('v1').globalForwardingRules.get({
        project: this.credentials.project,
        auth: this.auth,
        forwardingRule: id,
      });
      return {
        id: rule.name || '',
        loadBalancerHostname: rule.IPAddress || '',
        host: rule.IPAddress || '',
        port: rule.portRange || 80,
        path: '/',
        url: '',
      };
    } catch {
      return undefined;
    }
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['ingressRule']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['ingressRule']>> {
    const forwarding_rules = await google.compute('v1').globalForwardingRules.list({
      project: this.credentials.project,
      auth: this.auth,
    });

    return {
      total: forwarding_rules.data.items?.length || 0,
      rows: (forwarding_rules.data.items || []).map((rule) => {
        return {
          id: rule.name || '',
          loadBalancerHostname: rule.IPAddress || '',
          host: rule.IPAddress || '',
          port: rule.portRange || 80,
          path: '/',
          url: '',
        };
      }),
    };
  }
}
