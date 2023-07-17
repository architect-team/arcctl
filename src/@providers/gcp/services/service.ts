import { Auth, google } from 'googleapis';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ProviderStore } from '../../store.ts';
import { TerraformResourceService } from '../../terraform.service.ts';
import { GoogleCloudCredentials } from '../credentials.ts';
import { GoogleCloudServiceModule } from '../modules/service.ts';

export class GoogleCloudServiceService extends TerraformResourceService<'service', GoogleCloudCredentials> {
  private auth: Auth.GoogleAuth;

  readonly terraform_version = '1.4.5';
  readonly construct = GoogleCloudServiceModule;

  constructor(accountName: string, credentials: GoogleCloudCredentials, providerStore: ProviderStore) {
    super(accountName, credentials, providerStore);
    this.auth = new Auth.GoogleAuth({
      keyFile: credentials.serviceAccountCredentialsFile,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
  }

  async get(
    id: string,
  ): Promise<ResourceOutputs['service'] | undefined> {
    try {
      const { data: backend } = await google.compute('v1').backendServices.get({
        project: this.credentials.project,
        auth: this.auth,
        backendService: id,
      });
      return {
        id: backend.name || '',
        name: backend.name || '',
        protocol: backend.protocol || 'unknown',
        port: backend.port || 80,
        target_port: backend.port || 80,
        host: '',
        url: '',
        account: this.accountName,
      };
    } catch {
      return undefined;
    }
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['service']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['service']>> {
    const backends = await google.compute('v1').backendServices.list({
      project: this.credentials.project,
      auth: this.auth,
    });

    return {
      total: backends.data.items?.length || 0,
      rows: (backends.data.items || []).map((backend) => {
        return {
          type: 'service',
          id: backend.name || '',
          name: backend.name || '',
          protocol: backend.protocol || 'unknown',
          port: backend.port || 80,
          host: '',
          url: '',
          account: this.accountName,
          target_port: backend.port || 0,
        };
      }),
    };
  }
}
