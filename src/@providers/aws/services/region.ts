import { ResourceOutputs } from '../../../@resources/index.js';
import { PagingOptions, PagingResponse } from '../../../utils/paging.js';
import { ResourceService } from '../../service.js';
import { AwsCredentials } from '../credentials.js';
import AwsUtils from '../utils.js';

export class AwsRegionService extends ResourceService<
  'region',
  AwsCredentials
> {
  constructor(private readonly credentials: AwsCredentials) {
    super();
  }

  get(id: string): Promise<ResourceOutputs['region'] | undefined> {
    return new Promise((resolve, reject) => {
      AwsUtils.getEC2(this.credentials).describeRegions(
        { RegionNames: [id] },
        (err, data) => {
          if (err) {
            reject(err);
            return;
          }

          if (!data.Regions || data.Regions.length <= 0) {
            resolve(undefined);
          } else {
            resolve({
              id: data.Regions[0].RegionName!,
              name: data.Regions[0].RegionName!,
            });
          }
        },
      );
    });
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['region']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['region']>> {
    const regionsData = await AwsUtils.getEC2(this.credentials)
      .describeRegions()
      .promise();
    return {
      total: regionsData.Regions?.length || 0,
      rows:
        regionsData.Regions?.map((r) => ({
          id: r.RegionName!,
          name: r.RegionName!,
        })) || [],
    };
  }
}
