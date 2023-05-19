import { ResourceOutputs } from '../../../@resources/index.js';
import { PagingOptions, PagingResponse } from '../../../utils/paging.js';
import { ResourceService } from '../../service.js';
import { AwsCredentials } from '../credentials.js';
import AwsUtils from '../utils.js';

export class AwsNodeSizeService extends ResourceService<
  'nodeSize',
  AwsCredentials
> {
  constructor(private readonly credentials: AwsCredentials) {
    super();
  }

  private async getInstanceTypes(
    ec2: AWS.EC2,
    token?: string,
  ): Promise<string[]> {
    const ec2InstanceTypeData = await ec2
      .describeInstanceTypes({
        NextToken: token,
      })
      .promise();
    const types: string[] = [
      ...(ec2InstanceTypeData.InstanceTypes?.map((instance) => {
        return instance.InstanceType || '';
      }) || []),
      ...(ec2InstanceTypeData.NextToken
        ? await this.getInstanceTypes(ec2, ec2InstanceTypeData.NextToken)
        : []),
    ];
    return types;
  }

  async get(id: string): Promise<ResourceOutputs['nodeSize'] | undefined> {
    const ec2 = AwsUtils.getEC2(this.credentials);
    const data = await this.getInstanceTypes(ec2);
    for (const type of data) {
      if (type === id) {
        return {
          id: type,
        };
      }
    }

    return undefined;
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['nodeSize']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['nodeSize']>> {
    const ec2 = AwsUtils.getEC2(this.credentials);
    const data = await this.getInstanceTypes(ec2);
    const types: ResourceOutputs['nodeSize'][] = [];
    for (const type of data) {
      types.push({
        id: type,
      });
    }
    return {
      total: types.length,
      rows: types,
    };
  }
}
