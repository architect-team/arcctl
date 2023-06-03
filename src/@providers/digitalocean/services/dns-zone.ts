import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { InputValidators } from '../../base.service.ts';
import { TerraformResourceService } from '../../terraform.service.ts';
import { DigitaloceanCredentials } from '../credentials.ts';
import { DigitaloceanDnsZoneModule } from '../modules/dns-zone.ts';
import { DigitaloceanProvider as TerraformDigitaloceanProvider } from '../.gen/providers/digitalocean/provider/index.ts';
import { Construct } from 'constructs';
import { createApiClient } from 'dots-wrapper';

export class DigitaloceanDnsZoneService extends TerraformResourceService<'dnsZone', DigitaloceanCredentials> {
  private client: ReturnType<typeof createApiClient>;

  readonly terraform_version = '1.4.5';
  readonly construct = DigitaloceanDnsZoneModule;

  constructor(credentials: DigitaloceanCredentials) {
    super(credentials);
    this.client = createApiClient({ token: credentials.token });
  }

  public configureTerraformProviders(scope: Construct): TerraformDigitaloceanProvider {
    return new TerraformDigitaloceanProvider(scope, 'digitalocean', {
      token: this.credentials.token,
    });
  }

  async get(id: string): Promise<ResourceOutputs['dnsZone'] | undefined> {
    try {
      const {
        data: { domain },
      } = await this.client.domain.getDomain({
        name: id,
      });

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
    const {
      data: { domains },
    } = await this.client.domain.listDomains({});

    return {
      total: domains?.length || 0,
      rows: (domains || []).map((domain) => {
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
