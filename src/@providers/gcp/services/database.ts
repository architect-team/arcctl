import { Construct } from 'constructs';
import { Auth, google } from 'npm:googleapis';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ProviderStore } from '../../store.ts';
import { TerraformResourceService } from '../../terraform.service.ts';
import { GoogleProvider as TerraformGoogleProvider } from '../.gen/providers/google/provider/index.ts';
import { GoogleCloudCredentials } from '../credentials.ts';
import { GoogleCloudDatabaseModule } from '../modules/database.ts';

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

  public configureTerraformProviders(scope: Construct): TerraformGoogleProvider {
    return new TerraformGoogleProvider(scope, 'gcp', {
      project: this.credentials.project,
      credentials: this.credentials.serviceAccountCredentialsFile,
    });
  }

  async get(
    id: string,
  ): Promise<ResourceOutputs['database'] | undefined> {
    try {
      const { data } = await google.sql('v1beta4').databases.get({
        auth: this.auth,
        project: this.credentials.project,
        instance: id,
      });

      // TODO: Fix database gets
      return {
        id: data.instance || '',
        host: data.selfLink || '',
        port: 0,
        username: '',
        password: '',
        protocol: data.instance || '',
      };
    } catch {
      return undefined;
    }
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['database']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['database']>> {
    const { data } = await google.sql('v1beta4').instances.list({
      auth: this.auth,
      project: this.credentials.project,
    });

    const databases: ResourceOutputs['database'][] = [];
    for (const instance of (data.items || [])) {
      // TODO: Fix database gets
      databases.push({
        id: instance.name || '',
        host: instance.ipAddresses?.at(0)?.ipAddress || '',
        port: 0,
        username: '',
        password: '',
        protocol: instance.databaseVersion || '',
      });
    }

    return {
      total: databases.length,
      rows: databases,
    };
  }
}
