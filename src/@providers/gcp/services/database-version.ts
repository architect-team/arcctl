import { Auth, google } from 'https://esm.sh/v124/googleapis@118.0.0';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ResourceService } from '../../base.service.ts';
import { ProviderStore } from '../../store.ts';
import { GoogleCloudCredentials } from '../credentials.ts';

export class GoogleCloudDatabaseVersionService extends ResourceService<'databaseVersion', GoogleCloudCredentials> {
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
  ): Promise<ResourceOutputs['databaseVersion'] | undefined> {
    return {
      id: 'not-implemented',
      databaseType: 'not-implemented',
      databaseVersion: 'not-implemented',
    };
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['databaseVersion']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['databaseVersion']>> {
    const { data } = await google.sql('v1beta4').flags.list({
      auth: this.auth,
    });
    const engines: ResourceOutputs['databaseVersion'][] = [];
    const seen_engines: string[] = [];
    for (const item of (data.items || [])) {
      for (const version of (item.appliesTo || [])) {
        if (seen_engines.includes(version)) {
          continue;
        }
        seen_engines.push(version);
        const engine_parts = version.split('_');
        const engine = engine_parts.shift() || '';
        const engine_version = engine_parts.join('_');
        if (filterOptions?.databaseType?.toLowerCase() !== engine.toLowerCase()) {
          continue;
        }
        engines.push({
          id: engine_version,
          databaseType: engine,
          databaseVersion: engine_version,
        });
      }
    }

    return {
      total: engines.length,
      rows: engines,
    };
  }
}
