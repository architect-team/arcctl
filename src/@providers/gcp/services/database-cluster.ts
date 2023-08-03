import { Auth, google } from 'googleapis';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ProviderStore } from '../../store.ts';
import { TerraformResourceService } from '../../terraform.service.ts';
import { GoogleCloudCredentials } from '../credentials.ts';
import { GoogleCloudDatabaseClusterModule } from '../modules/database-cluster.ts';
import GcpUtils from '../utils.ts';

export class GoogleCloudDatabaseClusterService
  extends TerraformResourceService<'databaseCluster', GoogleCloudCredentials> {
  private auth: Auth.GoogleAuth;
  readonly terraform_version = '1.4.5';
  readonly construct = GoogleCloudDatabaseClusterModule;

  constructor(accountName: string, credentials: GoogleCloudCredentials, providerStore: ProviderStore) {
    super(accountName, credentials, providerStore);
    this.auth = new Auth.GoogleAuth({
      keyFile: credentials.serviceAccountCredentialsFile,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
  }

  async get(
    id: string,
  ): Promise<ResourceOutputs['databaseCluster'] | undefined> {
    const results = (await this.list()).rows.filter((r) => r.id === id);
    if (results.length > 0) {
      return results[0];
    }

    return undefined;
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['databaseCluster']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['databaseCluster']>> {
    const { data } = await google.sql('v1beta4').instances.list({
      auth: this.auth,
      project: this.credentials.project,
    });

    const databases: ResourceOutputs['databaseCluster'][] = [];
    for (const instance of (data.items || [])) {
      const host = instance.ipAddresses?.filter((ip_mapping) =>
        ip_mapping.type === 'PRIVATE'
      ).map((ip_mapping) => ip_mapping.ipAddress).at(0) || '';
      const { port, protocol } = GcpUtils.databasePortAndProtocol(instance.databaseVersion || '');

      databases.push({
        id: instance.name || '',
        host: host,
        port: port,
        username: 'admin',
        password: '[omitted]',
        protocol,
      });
    }

    return {
      total: databases.length,
      rows: databases,
    };
  }
}
