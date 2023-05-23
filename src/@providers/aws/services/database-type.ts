import { ResourceOutputs } from '../../../@resources/index.js';
import { PagingOptions, PagingResponse } from '../../../utils/paging.js';
import { ReadOnlyResourceService } from '../../service.js';
import { AwsCredentials } from '../credentials.js';
import AwsUtils from '../utils.js';

export class AwsDatabaseTypeService extends ReadOnlyResourceService<'databaseType'> {
  constructor(private readonly credentials: AwsCredentials) {
    super();
  }

  async get(id: string): Promise<ResourceOutputs['databaseType'] | undefined> {
    return undefined;
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['databaseType']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['databaseType']>> {
    const rds = AwsUtils.getRDS(this.credentials);
    let marker = '';
    const engines: string[] = [];
    while (marker !== 'done') {
      const engineVersions = await rds
        .describeDBEngineVersions({
          MaxRecords: 100,
          Marker: marker,
        })
        .promise();
      if (engineVersions?.DBEngineVersions) {
        for (const engine of engineVersions?.DBEngineVersions || []) {
          if (!engine.Engine || engines.includes(engine.Engine)) {
            continue;
          }
          if (engine.Engine.startsWith('aurora')) {
            continue;
          }
          engines.push(engine.Engine);
        }
      }
      marker = engineVersions?.Marker || 'done';
    }

    return {
      total: engines.length,
      rows: engines.map((engine) => ({
        id: engine,
        name: engine,
      })),
    };
  }
}
