import { Auth, google } from 'googleapis';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ResourceService } from '../../base.service.ts';
import { ProviderStore } from '../../store.ts';
import { GoogleCloudCredentials } from '../credentials.ts';

export class GoogleCloudRegionService extends ResourceService<'region', GoogleCloudCredentials> {
  private auth: Auth.GoogleAuth;

  constructor(accountName: string, credentials: GoogleCloudCredentials, providerStore: ProviderStore) {
    super(accountName, credentials, providerStore);
    this.auth = new Auth.GoogleAuth({
      keyFile: credentials.serviceAccountCredentialsFile,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
  }

  async get(id: string): Promise<ResourceOutputs['region'] | undefined> {
    try {
      const region = await google.compute('v1').zones.get({
        auth: this.auth,
        zone: id,
      });
      return {
        id: region.data.id || '',
        name: region.data.name || '',
      };
    } catch {
      return undefined;
    }
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['region']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['region']>> {
    const regions = await google.compute('v1').zones.list({
      project: this.credentials.project,
      auth: this.auth,
    });
    return {
      total: regions.data.items?.length || 0,
      rows: (regions.data.items || []).map((region) => ({
        id: region.name || '',
        type: 'region',
        name: region.name || '',
      })),
    };
  }
}
