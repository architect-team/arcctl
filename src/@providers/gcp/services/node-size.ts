import { Auth, google } from 'npm:googleapis';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ResourceService } from '../../base.service.ts';
import { ProviderStore } from '../../store.ts';
import { GoogleCloudCredentials } from '../credentials.ts';

export class GoogleCloudNodeSizeService extends ResourceService<'nodeSize', GoogleCloudCredentials> {
  private auth: Auth.GoogleAuth;

  constructor(accountName: string, credentials: GoogleCloudCredentials, providerStore: ProviderStore) {
    super(accountName, credentials, providerStore);
    this.auth = new Auth.GoogleAuth({
      keyFile: credentials.serviceAccountCredentialsFile,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
  }

  async get(id: string): Promise<ResourceOutputs['nodeSize'] | undefined> {
    try {
      const { data: machineType } = await google
        .compute('v1')
        .machineTypes.get({
          machineType: id,
          auth: this.auth,
          project: this.credentials.project,
        });
      return {
        id: machineType.id || '',
      };
    } catch {
      return undefined;
    }
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['nodeSize']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['nodeSize']>> {
    const machineTypes = await google.compute('v1').machineTypes.list({
      auth: this.auth,
      zone: filterOptions?.region || 'us-west2-a',
      project: this.credentials.project,
    });
    return {
      total: machineTypes.data.items?.length || 0,
      rows: (machineTypes.data.items || []).map((machineType) => {
        return {
          name: machineType.name || '',
          id: machineType.name || '',
          type: 'nodeSize',
        };
      }),
    };
  }
}
