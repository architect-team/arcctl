import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ResourceService } from '../../service.ts';
import { DigitaloceanCredentials } from '../credentials.ts';
import { DigitaloceanVpcModule } from '../modules/vpc.ts';
import { createApiClient } from 'dots-wrapper';
import { IVpc } from 'dots-wrapper/dist/vpc/index.ts';

export class DigitaloceanVpcService extends ResourceService<
  'vpc',
  DigitaloceanCredentials
> {
  private client: ReturnType<typeof createApiClient>;

  constructor(credentials: DigitaloceanCredentials) {
    super();
    this.client = createApiClient({ token: credentials.token });
  }

  private normalizeVpc(vpc: IVpc): ResourceOutputs['vpc'] {
    return {
      id: vpc.id,
      name: vpc.name,
      description: vpc.description,
      region: vpc.region,
    };
  }

  async get(id: string): Promise<ResourceOutputs['vpc']> {
    const {
      data: { vpc },
    } = await this.client.vpc.getVpc({ vpc_id: id });
    return this.normalizeVpc(vpc);
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['vpc']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['vpc']>> {
    const {
      data: { vpcs },
    } = await this.client.vpc.listVpcs({});
    const regionVpcs = filterOptions?.region
      ? vpcs.filter((vpc) => {
          return vpc.region === filterOptions.region;
        })
      : vpcs;
    return {
      total: regionVpcs.length,
      rows: regionVpcs.map((vpc) => this.normalizeVpc(vpc)),
    };
  }

  manage = {
    validators: {
      name: (input: string) => {
        return (
          /^[\d.A-Za-z-]+$/.test(input) ||
          'Must be unique and contain alphanumeric characters, dashes, and periods only.'
        );
      },

      description: (input?: string) => {
        return (
          !input ||
          input.length <= 255 ||
          'Description must be less than 255 characters.'
        );
      },
    },

    module: DigitaloceanVpcModule,
  };
}
