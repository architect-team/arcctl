import { ResourceOutputs } from '../../../@resources/index.js';
import { PagingOptions, PagingResponse } from '../../../utils/paging.js';
import { ResourceService } from '../../service.js';
import { AwsCredentials } from '../credentials.js';
import AwsUtils from '../utils.js';

export class AwsDatabaseVersionService extends ResourceService<
  'databaseVersion',
  AwsCredentials
> {
  constructor(private readonly credentials: AwsCredentials) {
    super();
  }

  async get(
    id: string,
  ): Promise<ResourceOutputs['databaseVersion'] | undefined> {
    return undefined;
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['databaseVersion']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['databaseVersion']>> {
    const rds = AwsUtils.getRDS(this.credentials);

    let marker = '';
    const engineVersions: ResourceOutputs['databaseVersion'][] = [];
    while (marker !== 'done') {
      const engineData = await rds
        .describeDBEngineVersions({
          Marker: marker,
          MaxRecords: 100,
        })
        .promise();
      if (engineData?.DBEngineVersions) {
        for (const engine of engineData?.DBEngineVersions || []) {
          if (
            filterOptions?.databaseType &&
            engine.Engine !== filterOptions.databaseType
          ) {
            continue;
          }
          const isUnique = !engineVersions.some(
            (e) => e.databaseVersion === engine.EngineVersion,
          );
          if (!engine.EngineVersion || !isUnique) {
            continue;
          }

          engineVersions.push({
            id: `${engine.EngineVersion}/${engine.MajorEngineVersion}`,
            databaseType: engine.Engine || '',
          });
        }
      }
      marker = engineData?.Marker || 'done';
    }

    return {
      total: engineVersions.length,
      rows: engineVersions,
    };
  }
}
