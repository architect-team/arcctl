import { ResourceOutputs } from '../../../@resources/index.js';
import { PagingOptions, PagingResponse } from '../../../utils/paging.js';
import { BaseService } from '../../service.js';
import { AwsCredentials } from '../credentials.js';
import AwsUtils from '../utils.js';

export class AwsDatabaseSizeService extends BaseService<'databaseSize'> {
  constructor(private readonly credentials: AwsCredentials) {
    super();
  }

  async get(id: string): Promise<ResourceOutputs['databaseSize'] | undefined> {
    return undefined;
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['databaseSize']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['databaseSize']>> {
    const rds = AwsUtils.getRDS(this.credentials);
    const instance_classes: string[] = [];
    let marker = '';
    while (marker !== 'done') {
      const data = await rds
        .describeOrderableDBInstanceOptions({
          Marker: marker,
          Engine: filterOptions?.databaseType || 'mysql',
          EngineVersion:
            filterOptions?.databaseVersion?.split('/')[0] || '5.7.33',
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
