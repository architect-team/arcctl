import { Construct } from 'constructs';
import { Auth } from 'googleapis';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ProviderStore } from '../../store.ts';
import { TerraformResourceService } from '../../terraform.service.ts';
import { GoogleProvider as TerraformGoogleProvider } from '../.gen/providers/google/provider/index.ts';
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

  public configureTerraformProviders(scope: Construct): TerraformGoogleProvider {
    return new TerraformGoogleProvider(scope, 'gcp', {
      project: this.credentials.project,
      credentials: this.credentials.serviceAccountCredentialsFile,
    });
  }

  async get(
    id: string,
  ): Promise<ResourceOutputs['ingressRule'] | undefined> {
    throw Error('unimplemented');
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['ingressRule']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['ingressRule']>> {
    throw Error('unimplemented');
  }
}
