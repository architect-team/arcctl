import { Auth, google } from 'googleapis';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ProviderStore, TerraformResourceService } from '../../index.ts';
import { GoogleCloudCredentials } from '../credentials.ts';
import { GoogleCloudSecretModule } from '../modules/secret.ts';

export class GoogleCloudSecretService extends TerraformResourceService<'secret', GoogleCloudCredentials> {
  private auth: Auth.GoogleAuth;
  readonly terraform_version = '1.4.5';
  readonly construct = GoogleCloudSecretModule;

  constructor(accountName: string, credentials: GoogleCloudCredentials, providerStore: ProviderStore) {
    super(accountName, credentials, providerStore);
    this.auth = new Auth.GoogleAuth({
      keyFile: credentials.serviceAccountCredentialsFile,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
  }

  async get(id: string): Promise<ResourceOutputs['secret'] | undefined> {
    try {
      const { data } = await google.secretmanager('v1').projects.secrets.versions.access({
        auth: this.auth,
        name: `projects/${this.credentials.project}/secrets/${id}/versions/latest`,
      });

      return {
        id,
        data: data.payload?.data || '',
      };
    } catch {
      return undefined;
    }
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['secret']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['secret']>> {
    const { data } = await google.secretmanager('v1').projects.secrets.list({
      auth: this.auth,
      parent: `projects/${this.credentials.project}`,
    });

    const rows: ResourceOutputs['secret'][] = [];
    for (const secret of (data.secrets || [])) {
      const id = secret.name?.split('/').pop() || '';
      const data = await this.get(id);
      rows.push({
        id,
        data: data?.data || '',
      });
    }

    return {
      total: data.totalSize || 0,
      rows,
    };
  }
}
