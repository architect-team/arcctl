import { Auth, google } from 'googleapis';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ResourceService } from '../../base.service.ts';
import { ProviderStore } from '../../store.ts';
import { GoogleCloudCredentials } from '../credentials.ts';

export class GoogleCloudDatabaseTypeService extends ResourceService<'databaseType', GoogleCloudCredentials> {
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
  ): Promise<ResourceOutputs['databaseType'] | undefined> {
    return {
      type: 'databaseType',
      id: 'not-implemented',
    };
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['databaseType']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['databaseType']>> {
    const { data } = await google.sql('v1beta4').flags.list({
      auth: this.auth,
    });
    const engines: string[] = [];
    for (const item of (data.items || [])) {
      for (const version of (item.appliesTo || [])) {
        const engine = version.split('_')[0];
        if (engines.includes(engine)) {
          continue;
        }
        engines.push(engine);
      }
    }

    return {
      total: engines.length,
      rows: engines.map((engine) => ({
        type: 'databaseType',
        id: engine,
      })),
    };
  }
}
