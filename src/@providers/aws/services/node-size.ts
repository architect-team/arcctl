import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ResourceService } from '../../base.service.ts';
import { AwsCredentials } from '../credentials.ts';
import AwsUtils from '../utils.ts';

export class AwsNodeSizeService extends ResourceService<'nodeSize', AwsCredentials> {
  private async getInstanceTypes(ec2: AWS.EC2, token?: string): Promise<string[]> {
    const ec2InstanceTypeData = await ec2
      .describeInstanceTypes({
        NextToken: token,
      })
      .promise();
    const types: string[] = [
      ...(ec2InstanceTypeData.InstanceTypes?.map((instance) => {
        return instance.InstanceType || '';
      }) || []),
      ...(ec2InstanceTypeData.NextToken ? await this.getInstanceTypes(ec2, ec2InstanceTypeData.NextToken) : []),
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
    _filterOptions?: Partial<ResourceOutputs['nodeSize']>,
    _pagingOptions?: Partial<PagingOptions>,
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
