import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ResourceService } from '../../service.ts';
import { AwsCredentials } from '../credentials.ts';
import AwsUtils from '../utils.ts';

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
    const rds = AwsUtils.getRDS(this.credentials, this.credentials.region);

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
            databaseVersion: engine.EngineVersion,
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
