import { Construct } from 'constructs';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ResourcePresets } from '../../base.service.ts';
import { TerraformResourceService } from '../../terraform.service.ts';
import { AwsProvider as TerraformAwsProvider } from '../.gen/providers/aws/provider/index.ts';
import { AwsCredentials } from '../credentials.ts';
import { AwsDatabaseClusterModule } from '../modules/database-cluster.ts';
import AwsUtils from '../utils.ts';
import { AwsRegionService } from './region.ts';

export class AwsDatabaseClusterService extends TerraformResourceService<'databaseCluster', AwsCredentials> {
  readonly terraform_version = '1.4.5';
  readonly construct = AwsDatabaseClusterModule;

  public configureTerraformProviders(scope: Construct): TerraformAwsProvider {
    return new TerraformAwsProvider(scope, 'aws', {
      accessKey: this.credentials.accessKeyId,
      secretKey: this.credentials.secretAccessKey,
    });
  }

  get(_id: string): Promise<ResourceOutputs['databaseCluster'] | undefined> {
    return Promise.resolve(undefined);
  }

  async list(
    _filterOptions?: Partial<ResourceOutputs['databaseCluster']>,
    _pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['databaseCluster']>> {
    const regions = await new AwsRegionService(this.accountName, this.credentials, this.providerStore).list();

    const databasePromises = [];
    const databases: ResourceOutputs['databaseCluster'][] = [];
    for (const region of regions.rows) {
      databasePromises.push(
        // deno-lint-ignore no-async-promise-executor
        new Promise<void>(async (resolve) => {
          const rds = AwsUtils.getRDS(this.credentials, region.id);
          const rds_databases = await rds.describeDBInstances({}).promise();
          for (const rds_database of rds_databases.DBInstances || []) {
            databases.push({
              id: `${region.id}/${rds_database.DBInstanceIdentifier}` || '',
              host: rds_database.Endpoint?.HostedZoneId || '',
              port: rds_database.Endpoint?.Port || 5432,
              protocol: rds_database.Engine || '',
              username: rds_database.MasterUsername || '',
              password: '',
            });
          }
          resolve();
        }),
      );
    }

    await Promise.all(databasePromises);
    return {
      total: databases.length,
      rows: databases,
    };
  }

  get presets(): ResourcePresets<'databaseCluster'> {
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
}