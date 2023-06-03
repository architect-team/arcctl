import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { TerraformResourceService } from '../../terraform.service.ts';
import { DigitaloceanCredentials } from '../credentials.ts';
import { DigitaloceanDatabaseModule } from '../modules/database.ts';
import { ResourcePresets } from '../../base.service.ts';
import { createApiClient } from 'dots-wrapper';
import { IDatabaseCluster } from 'dots-wrapper/dist/database/index.ts';
import { DigitaloceanProvider as TerraformDigitaloceanProvider } from '../.gen/providers/digitalocean/provider/index.ts';
import { Construct } from 'constructs';

export class DigitaloceanDatabaseService extends TerraformResourceService<'database', DigitaloceanCredentials> {
  private client: ReturnType<typeof createApiClient>;

  readonly terraform_version = '1.4.5';
  readonly construct = DigitaloceanDatabaseModule;

  constructor(credentials: DigitaloceanCredentials) {
    super(credentials);
    this.client = createApiClient({ token: credentials.token });
  }

  private normalizeDatabase(database: IDatabaseCluster): ResourceOutputs['database'] {
    return {
      id: database.id,
      host: database.connection.host,
      port: database.connection.port,
      account: '',
      protocol: database.engine === 'pg' ? 'postgresql' : database.engine,
    };
  }

  public configureTerraformProviders(scope: Construct): TerraformDigitaloceanProvider {
    return new TerraformDigitaloceanProvider(scope, 'digitalocean', {
      token: this.credentials.token,
    });
  }

  async get(id: string): Promise<ResourceOutputs['database'] | undefined> {
    const {
      data: { database },
    } = await this.client.database.getDatabaseCluster({
      database_cluster_id: id,
    });
    return this.normalizeDatabase(database);
  }

  // TODO: implement filter
  async list(
    _filterOptions?: Partial<ResourceOutputs['database']>,
    _pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['database']>> {
    const {
      data: { databases },
    } = await this.client.database.listDatabaseClusters({});
    return {
      total: databases.length,
      rows: databases.map((element) => this.normalizeDatabase(element)),
    };
  }

  get presets(): ResourcePresets<'database'> {
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
