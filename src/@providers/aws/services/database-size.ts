import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ResourceService } from '../../base.service.ts';
import { AwsCredentials } from '../credentials.ts';
import AwsUtils from '../utils.ts';

export class AwsDatabaseSizeService extends ResourceService<'databaseSize', AwsCredentials> {
  get(_id: string): Promise<ResourceOutputs['databaseSize'] | undefined> {
    return Promise.resolve(undefined);
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['databaseSize']>,
    _pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['databaseSize']>> {
    const rds = AwsUtils.getRDS(this.credentials);
    const instance_classes: string[] = [];
    let marker = '';
    while (marker !== 'done') {
      const data = await rds
        .describeOrderableDBInstanceOptions({
          Marker: marker,
          Engine: filterOptions?.databaseType || 'mysql',
          EngineVersion: filterOptions?.databaseVersion?.split('/')[0] || '5.7.33',
        })
        .promise();
      for (const instance_option of data.OrderableDBInstanceOptions || []) {
        if (!instance_option.DBInstanceClass) {
          continue;
        }
        if (instance_classes.includes(instance_option.DBInstanceClass)) {
          continue;
        }
        instance_classes.push(instance_option.DBInstanceClass);
      }
      marker = data.Marker || 'done';
    }
    return {
      total: instance_classes.length,
      rows: instance_classes.map((instanceClass) => ({
        id: instanceClass,
        databaseType: filterOptions?.databaseType || '',
        databaseVersion: filterOptions?.databaseVersion || '',
      })),
    };
  }
}
