import { Auth, google } from 'https://esm.sh/v124/googleapis@118.0.0';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ResourceService } from '../../base.service.ts';
import { ProviderStore } from '../../store.ts';
import { GoogleCloudCredentials } from '../credentials.ts';

export class GoogleCloudKubernetesVersionService extends ResourceService<'kubernetesVersion', GoogleCloudCredentials> {
  private auth: Auth.GoogleAuth;

  constructor(accountName: string, credentials: GoogleCloudCredentials, providerStore: ProviderStore) {
    super(accountName, credentials, providerStore);
    this.auth = new Auth.GoogleAuth({
      keyFile: credentials.serviceAccountCredentialsFile,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
  }

  async get(
    id: string,
  ): Promise<ResourceOutputs['kubernetesVersion'] | undefined> {
    const list_res = await this.list();
    return list_res.rows.find((item) => item.id === id);
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['kubernetesVersion']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['kubernetesVersion']>> {
    const serverConfig = await google
      .container('v1')
      .projects.zones.getServerconfig({
        auth: this.auth,
        zone: 'us-east1',
        projectId: this.credentials.project,
      });
    return {
      total: serverConfig.data.validMasterVersions?.length || 0,
      rows: (serverConfig.data.validMasterVersions || []).map((value) => {
        return {
          name: value || '',
          id: value || '',
          type: 'kubernetesVersion',
        };
      }),
    };
  }
}
