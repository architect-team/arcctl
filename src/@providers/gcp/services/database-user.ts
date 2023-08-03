import { Auth, google } from 'googleapis';
import { ResourceOutputs } from '../../../@resources/types.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ProviderStore } from '../../store.ts';
import { TerraformResourceService } from '../../terraform.service.ts';
import { GoogleCloudCredentials } from '../credentials.ts';
import { GoogleCloudDatabaseUserModule } from '../modules/database-user.ts';

export class GoogleCloudDatabaseUserService extends TerraformResourceService<'databaseUser', GoogleCloudCredentials> {
  private auth: Auth.GoogleAuth;
  readonly terraform_version = '1.4.5';
  readonly construct = GoogleCloudDatabaseUserModule;

  constructor(accountName: string, credentials: GoogleCloudCredentials, providerStore: ProviderStore) {
    super(accountName, credentials, providerStore);
    this.auth = new Auth.GoogleAuth({
      keyFile: credentials.serviceAccountCredentialsFile,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
  }

  async get(id: string): Promise<ResourceOutputs['databaseUser'] | undefined> {
    const results = (await this.list()).rows.filter((r) => r.id === id);
    if (results.length > 0) {
      return results[0];
    }

    return undefined;
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['databaseUser']>,
    _pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['databaseUser']>> {
    const { data: database_data } = await google.sql('v1beta4').instances.list({
      auth: this.auth,
      project: this.credentials.project,
    });

    const users: ResourceOutputs['databaseUser'][] = [];
    for (const instance of (database_data.items || [])) {
      const host = instance.ipAddresses?.filter((ip_mapping) =>
        ip_mapping.type === 'PRIVATE'
      ).map((ip_mapping) => ip_mapping.ipAddress).at(0) || '';
      let port;
      let protocol;
      if (instance.databaseVersion?.toLowerCase().includes('mysql')) {
        port = 3306;
        protocol = 'mysql';
      } else if (instance.databaseVersion?.toLowerCase().includes('postgres')) {
        port = 5432;
        protocol = 'postgresql';
      } else {
        port = 1433;
        protocol = 'sqlserver';
      }

      const { data } = await google.sql('v1beta4').users.list({
        auth: this.auth,
        project: this.credentials.project,
        instance: instance.name || '',
      });

      for (const user of (data.items || [])) {
        users.push({
          id: user.name || 'unknown',
          username: user.name || 'unknown',
          password: '[omitted]',
          database: instance.name || 'unknown',
          protocol,
          host,
          port,
          url: `${protocol}://${host}:${port}/${instance.name}`,
        });
      }
    }

    return {
      total: users.length,
      rows: users,
    };
  }
}
