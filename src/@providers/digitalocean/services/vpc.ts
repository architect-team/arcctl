import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { InputValidators } from '../../base.service.ts';
import { TerraformResourceService } from '../../terraform.service.ts';
import { DigitaloceanCredentials } from '../credentials.ts';
import { DigitaloceanVpcModule } from '../modules/vpc.ts';
import { DigitaloceanProvider as TerraformDigitaloceanProvider } from '../.gen/providers/digitalocean/provider/index.ts';
import { Construct } from 'constructs';
import { createApiClient } from 'dots-wrapper';
import { IVpc } from 'dots-wrapper/dist/vpc/index.ts';

export class DigitaloceanVpcService extends TerraformResourceService<'vpc', DigitaloceanCredentials> {
  private client: ReturnType<typeof createApiClient>;

  readonly terraform_version = '1.4.5';
  readonly construct = DigitaloceanVpcModule;

  constructor(credentials: DigitaloceanCredentials) {
    super(credentials);
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

  public configureTerraformProviders(scope: Construct): TerraformDigitaloceanProvider {
    return new TerraformDigitaloceanProvider(scope, 'digitalocean', {
      token: this.credentials.token,
    });
  }

  async get(id: string): Promise<ResourceOutputs['vpc']> {
    const {
      data: { vpc },
    } = await this.client.vpc.getVpc({ vpc_id: id });
    return this.normalizeVpc(vpc);
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['vpc']>,
    _pagingOptions?: Partial<PagingOptions>,
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

  get validators(): InputValidators<'vpc'> {
    return {
      name: (input: string) => {
        return (
          /^[\d.A-Za-z-]+$/.test(input) ||
          'Must be unique and contain alphanumeric characters, dashes, and periods only.'
        );
      },

      description: (input?: string) => {
        return !input || input.length <= 255 || 'Description must be less than 255 characters.';
      },
    };
  }
}
