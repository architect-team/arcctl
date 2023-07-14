import { Auth, google } from 'googleapis';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ResourceService } from '../../base.service.ts';
import { ProviderStore } from '../../store.ts';
import { GoogleCloudCredentials } from '../credentials.ts';

export class GoogleCloudDatabaseSizeService extends ResourceService<'databaseSize', GoogleCloudCredentials> {
  private auth: Auth.GoogleAuth;

  constructor(accountName: string, credentials: GoogleCloudCredentials, providerStore: ProviderStore) {
    super(accountName, credentials, providerStore);
    this.auth = new Auth.GoogleAuth({
      keyFile: credentials.serviceAccountCredentialsFile,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
  }

  async get(id: string): Promise<ResourceOutputs['databaseSize'] | undefined> {
    return undefined;
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['databaseSize']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['databaseSize']>> {
    const databaseTypes = await google.sql('v1beta4').tiers.list({
      auth: this.auth,
      project: this.credentials.project,
    });
    const results: ResourceOutputs['databaseSize'][] = [];
    for (const entry of (databaseTypes.data.items || [])) {
      results.push({
        id: entry.tier || '',
        databaseType: filterOptions?.databaseType || '',
        databaseVersion: filterOptions?.databaseVersion || '',
      });
    }
    return {
      total: results.length,
      rows: results,
    };
  }
}
