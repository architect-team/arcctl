import { Construct } from 'constructs';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { InputValidators } from '../../base.service.ts';
import { TerraformResourceService } from '../../terraform.service.ts';
import { AwsProvider as TerraformAwsProvider } from '../.gen/providers/aws/provider/index.ts';
import { AwsCredentials } from '../credentials.ts';
import { AwsVpcModule } from '../modules/vpc.ts';
import AwsUtils from '../utils.ts';
import { AwsRegionService } from './region.ts';

export class AwsVpcService extends TerraformResourceService<'vpc', AwsCredentials> {
  readonly terraform_version = '1.4.5';
  readonly construct = AwsVpcModule;

  private normalizeVpc(region: string, vpc: AWS.EC2.Vpc): ResourceOutputs['vpc'] {
    return {
      id: `${region}/${vpc.VpcId}`,
      name: vpc.Tags?.find((tag) => tag.Key === 'Name')?.Value || '',
      description: vpc.Tags?.find((tag) => tag.Key === 'Description')?.Value || '',
      region: region,
    };
  }

  public configureTerraformProviders(scope: Construct): TerraformAwsProvider {
    return new TerraformAwsProvider(scope, 'aws', {
      accessKey: this.credentials.accessKeyId,
      secretKey: this.credentials.secretAccessKey,
    });
  }

  get(id: string): Promise<ResourceOutputs['vpc'] | undefined> {
    return new Promise((resolve, reject) => {
      const match = id.match(/^([\dA-Za-z-]+)\/([\w-]+)$/);
      if (!match) {
        reject(new Error('ID must be of the format, <region>/<uuid>'));
        return;
      }

      const [_, region, uuid] = match;
      AwsUtils.getEC2(this.credentials, region).describeVpcs({ VpcIds: [uuid] }, (err, data) => {
        if (err) {
          reject(err);
          return;
        }

        if (!data.Vpcs || data.Vpcs.length <= 0) {
          resolve(undefined);
        } else {
          resolve(this.normalizeVpc(region, data.Vpcs[0]));
        }
      });
    });
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['vpc']>,
    _pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['vpc']>> {
    const regions = await new AwsRegionService(this.accountName, this.credentials, this.providerStore).list();

    const res: PagingResponse<ResourceOutputs['vpc']> = {
      total: 0,
      rows: [],
    };

    const filterBy = (filterOptions || {}) as Partial<ResourceOutputs['vpc']>;
    const defaultFilters = [
      {
        Name: 'is-default',
        Values: ['false'],
      },
    ];

    const vpcPromises = [];
    for (const region of regions.rows.filter((r) => (filterBy.region ? r.id === filterBy.region : true))) {
      vpcPromises.push((async () => {
        const vpcData = await AwsUtils.getEC2(this.credentials, region.id)
          .describeVpcs(
            filterBy.name
              ? {
                Filters: [
                  {
                    Name: 'tag:Name',
                    Values: [filterBy.name],
                  },
                  ...defaultFilters,
                ],
              }
              : {
                Filters: defaultFilters,
              },
          )
          .promise();
        res.total += vpcData?.Vpcs?.length || 0;
        res.rows.push(...(vpcData?.Vpcs || []).map((vpc) => this.normalizeVpc(region.id, vpc)));
      })());
    }

    await Promise.all(vpcPromises);

    return res;
  }

  get validators(): InputValidators<'vpc'> {
    return {
      name: (input: string) => {
        if (!/^[\w.-]+$/.test(input)) {
          return 'Name must only contain alphanumeric characters as well as dashes, underscores and periods.';
        } else if (input.length > 50) {
          return 'Name must be 1-50 characters long.';
        }

        return true;
      },
    };
  }
}
