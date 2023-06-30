import { Construct } from 'constructs';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { InputValidators } from '../../base.service.ts';
import { ProviderStore } from '../../store.ts';
import { TerraformResourceService } from '../../terraform.service.ts';
import { DigitaloceanProvider as TerraformDigitaloceanProvider } from '../.gen/providers/digitalocean/provider/index.ts';
import { DigitaloceanCredentials } from '../credentials.ts';
import { DigitaloceanDnsZoneModule } from '../modules/dns-zone.ts';
import { digitalOceanApiRequest } from '../utils.ts';

export class DigitaloceanDnsZoneService extends TerraformResourceService<'dnsZone', DigitaloceanCredentials> {
  readonly terraform_version = '1.4.5';
  readonly construct = DigitaloceanDnsZoneModule;

  constructor(accountName: string, credentials: DigitaloceanCredentials, providerStore: ProviderStore) {
    super(accountName, credentials, providerStore);
  }

  public configureTerraformProviders(scope: Construct): TerraformDigitaloceanProvider {
    return new TerraformDigitaloceanProvider(scope, 'digitalocean', {
      token: this.credentials.token,
    });
  }

  async get(id: string): Promise<ResourceOutputs['dnsZone'] | undefined> {
    try {
      const domain = (await digitalOceanApiRequest({
        credentials: this.credentials,
        path: `/domains/${id}`,
      })).domain;

      return {
        id: domain.name,
        name: domain.name,
        nameservers: [domain.zone_file],
      };
    } catch {
      return undefined;
    }
  }

  async list(
    _filterOptions?: Partial<ResourceOutputs['dnsZone']>,
    _pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['dnsZone']>> {
    const domains = (await digitalOceanApiRequest({
      credentials: this.credentials,
      path: `/domains`,
    })).domains;

    return {
      total: domains?.length || 0,
      rows: (domains || []).map((domain: any) => {
        return {
          type: 'dnsZone',
          id: domain.name || '',
          name: domain.name || '',
          nameservers: [domain.zone_file],
        };
      }),
    };
  }

  get validators(): InputValidators<'dnsZone'> {
    return {
      name: (input: string): string | true => {
        if (!/^\*?\S+\.\S+$/.test(input)) {
          return 'Name must have more than two parts separated by periods and can have an optional asterisk at the beginning. Whitespace characters are not allowed.';
        }
        return true;
      },
    };
  }
}
