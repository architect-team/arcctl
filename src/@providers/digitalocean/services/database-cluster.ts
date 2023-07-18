import { Construct } from 'constructs';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ResourcePresets } from '../../base.service.ts';
import { ProviderStore } from '../../store.ts';
import { TerraformResourceService } from '../../terraform.service.ts';
import { DigitaloceanProvider as TerraformDigitaloceanProvider } from '../.gen/providers/digitalocean/provider/index.ts';
import { DigitaloceanCredentials } from '../credentials.ts';
import { DigitaloceanDatabaseClusterModule } from '../modules/database-cluster.ts';
import { digitalOceanApiRequest } from '../utils.ts';

export class DigitaloceanDatabaseClusterService
  extends TerraformResourceService<'databaseCluster', DigitaloceanCredentials> {
  readonly terraform_version = '1.4.5';
  readonly construct = DigitaloceanDatabaseClusterModule;

  constructor(accountName: string, credentials: DigitaloceanCredentials, providerStore: ProviderStore) {
    super(accountName, credentials, providerStore);
  }

  private normalizeDatabase(database: any): ResourceOutputs['databaseCluster'] {
    return {
      id: database.id,
      host: database.connection.host,
      port: database.connection.port,
      username: database.connection.user,
      password: database.connection.password,
      protocol: database.engine === 'pg' ? 'postgresql' : database.engine,
    };
  }

  public configureTerraformProviders(scope: Construct): TerraformDigitaloceanProvider {
    return new TerraformDigitaloceanProvider(scope, 'digitalocean', {
      token: this.credentials.token,
    });
  }

  async get(id: string): Promise<ResourceOutputs['databaseCluster'] | undefined> {
    const cluster = await digitalOceanApiRequest({
      credentials: this.credentials,
      path: `/databases/${id}`,
    });
    return this.normalizeDatabase(cluster.database);
  }

  // TODO: implement filter
  async list(
    _filterOptions?: Partial<ResourceOutputs['databaseCluster']>,
    _pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['databaseCluster']>> {
    const databases = (await digitalOceanApiRequest({
      credentials: this.credentials,
      path: `/databases`,
    })).databases;
    return {
      total: databases.length,
      rows: databases.map((element: any) => this.normalizeDatabase(element)),
    };
  }

  get presets(): ResourcePresets<'databaseCluster'> {
    return [
      {
        display: 'Development',
        values: {
          databaseType: 'pg',
          databaseVersion: '14',
          databaseSize: 'db-s-1vcpu-1gb',
        },
      },
    ];
  }
}
