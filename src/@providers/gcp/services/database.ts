import { Auth, google } from 'googleapis';
import { ResourceOutputs } from '../../../@resources/types.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ProviderStore } from '../../store.ts';
import { TerraformResourceService } from '../../terraform.service.ts';
import { GoogleCloudCredentials } from '../credentials.ts';
import { GoogleCloudDatabaseModule } from '../modules/database.ts';
import GcpUtils from '../utils.ts';

export class GoogleCloudDatabaseService extends TerraformResourceService<'database', GoogleCloudCredentials> {
  private auth: Auth.GoogleAuth;
  readonly terraform_version = '1.4.5';
  readonly construct = GoogleCloudDatabaseModule;

  constructor(accountName: string, credentials: GoogleCloudCredentials, providerStore: ProviderStore) {
    super(accountName, credentials, providerStore);
    this.auth = new Auth.GoogleAuth({
      keyFile: credentials.serviceAccountCredentialsFile,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
  }

  async get(id: string): Promise<ResourceOutputs['database'] | undefined> {
    const results = (await this.list()).rows.filter((r) => r.id === id);
    if (results.length > 0) {
      return results[0];
    }

    return undefined;
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['database']>,
    _pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['database']>> {
    const { data: database_data } = await google.sql('v1beta4').instances.list({
      auth: this.auth,
      project: this.credentials.project,
    });

    const databases: ResourceOutputs['database'][] = [];
    for (const instance of (database_data.items || [])) {
      const host = instance.ipAddresses?.filter((ip_mapping) =>
        ip_mapping.type === 'PRIVATE'
      ).map((ip_mapping) => ip_mapping.ipAddress).at(0) || '';
      const { port, protocol } = GcpUtils.databasePortAndProtocol(instance.databaseVersion || '');

      const { data } = await google.sql('v1beta4').databases.list({
        auth: this.auth,
        project: this.credentials.project,
        instance: instance.name || '',
      });

      for (const database of (data.items || [])) {
        databases.push({
          id: `${instance.name}/${database.name}`,
          name: database.name || 'unknown',
          host,
          port,
          protocol,
          username: '',
          password: '',
          account: this.accountName,
          url: `${protocol}://${host}:${port}/${instance.name}`,
        });
      }
    }

    return {
      total: databases.length,
      rows: databases,
    };
  }
}
