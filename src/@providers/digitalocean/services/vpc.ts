import { Construct } from 'constructs';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { InputValidators } from '../../base.service.ts';
import { ProviderStore } from '../../store.ts';
import { TerraformResourceService } from '../../terraform.service.ts';
import { DigitaloceanProvider as TerraformDigitaloceanProvider } from '../.gen/providers/digitalocean/provider/index.ts';
import { DigitaloceanCredentials } from '../credentials.ts';
import { DigitaloceanVpcModule } from '../modules/vpc.ts';
import { digitalOceanApiRequest } from '../utils.ts';

export class DigitaloceanVpcService extends TerraformResourceService<'vpc', DigitaloceanCredentials> {
  readonly terraform_version = '1.4.5';
  readonly construct = DigitaloceanVpcModule;

  constructor(accountName: string, credentials: DigitaloceanCredentials, providerStore: ProviderStore) {
    super(accountName, credentials, providerStore);
  }

  private normalizeVpc(vpc: any): ResourceOutputs['vpc'] {
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
    const vpc = (await digitalOceanApiRequest({
      credentials: this.credentials,
      path: `/vpcs/${id}`,
    })).vpc;
    return this.normalizeVpc(vpc);
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['vpc']>,
    _pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['vpc']>> {
    const vpcs = (await digitalOceanApiRequest({
      credentials: this.credentials,
      path: `/vpcs`,
    })).vpcs;
    const regionVpcs = filterOptions?.region
      ? vpcs.filter((vpc: any) => {
        return vpc.region === filterOptions.region;
      })
      : vpcs;
    return {
      total: regionVpcs.length,
      rows: regionVpcs.map((vpc: any) => this.normalizeVpc(vpc)),
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
