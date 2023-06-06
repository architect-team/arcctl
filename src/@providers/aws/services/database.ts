import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ResourcePresets } from '../../service.ts';
import { TerraformResourceService } from '../../terraform.service.ts';
import { AwsCredentials } from '../credentials.ts';
import { AwsDatabaseModule } from '../modules/database.ts';
import AwsUtils from '../utils.ts';
import { AwsRegionService } from './region.ts';

export class AwsDatabaseService extends TerraformResourceService<'database', AwsCredentials> {
  constructor(private readonly credentials: AwsCredentials) {
    super();
  }

  // deno-lint-ignore require-await
  async get(id: string): Promise<ResourceOutputs['database'] | undefined> {
    return undefined;
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['database']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['database']>> {
    const regions = await new AwsRegionService(this.credentials).list();

    const databasePromises = [];
    const databases: ResourceOutputs['database'][] = [];
    for (const region of regions.rows) {
      databasePromises.push((async () => {
        const rds = AwsUtils.getRDS(this.credentials, region.id);
        const rds_databases = await rds.describeDBInstances({}).promise();
        for (const rds_database of rds_databases.DBInstances || []) {
          databases.push({
            id: `${region.id}/${rds_database.DBInstanceIdentifier}` || '',
            host: rds_database.Endpoint?.HostedZoneId || '',
            port: rds_database.Endpoint?.Port || 5432,
            protocol: rds_database.Engine || '',
            account: '',
          });
        }
      })());
    }

    await Promise.all(databasePromises);
    return {
      total: databases.length,
      rows: databases,
    };
  }

  get presets(): ResourcePresets<'database'> {
    return [
      {
        display: 'Development',
        values: {
          databaseType: 'postgres',
          databaseVersion: '14.7/14',
          databaseSize: 'db.t3.medium',
        },
      },
    ];
  }

  construct = AwsDatabaseModule;
}
