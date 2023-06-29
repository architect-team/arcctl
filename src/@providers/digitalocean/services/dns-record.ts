import { Construct } from 'constructs';
import { createApiClient } from 'dots-wrapper';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { InputValidators } from '../../base.service.ts';
import { ProviderStore } from '../../store.ts';
import { TerraformResourceService } from '../../terraform.service.ts';
import { DigitaloceanProvider as TerraformDigitaloceanProvider } from '../.gen/providers/digitalocean/provider/index.ts';
import { DigitaloceanCredentials } from '../credentials.ts';
import { DigitaloceanDnsRecordModule } from '../modules/dns-record.ts';
import { digitalOceanApiRequest } from '../utils.ts';

export class DigitaloceanDnsRecordService extends TerraformResourceService<'dnsRecord', DigitaloceanCredentials> {
  private client: ReturnType<typeof createApiClient>;

  readonly terraform_version = '1.4.5';
  readonly construct = DigitaloceanDnsRecordModule;

  constructor(accountName: string, credentials: DigitaloceanCredentials, providerStore: ProviderStore) {
    super(accountName, credentials, providerStore);
    this.client = createApiClient({ token: credentials.token });
  }

  public configureTerraformProviders(scope: Construct): TerraformDigitaloceanProvider {
    return new TerraformDigitaloceanProvider(scope, 'digitalocean', {
      token: this.credentials.token,
    });
  }

  async get(id: string): Promise<ResourceOutputs['dnsRecord'] | undefined> {
    const [managed_zone, record_id] = id.split(',');

    try {
      const domain_record = (await digitalOceanApiRequest({
        credentials: this.credentials,
        path: `/domains/${managed_zone}/records/${record_id}`,
      })).domain_record;

      return {
        id: domain_record.id.toString() || '',
        name: domain_record.name || '',
        data: [domain_record.data] || [],
        recordType: domain_record.type || '',
        managedZone: managed_zone,
      };
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  async list(
    _filterOptions?: Partial<ResourceOutputs['dnsRecord']>,
    _pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['dnsRecord']>> {
    const domains = (await digitalOceanApiRequest({
      credentials: this.credentials,
      path: `/domains`,
    })).domains;

    const dns_record_rows: ResourceOutputs['dnsRecord'][] = [];
    for (const dns_zone of domains || []) {
      if (dns_zone.name) {
        const domain_records = (await digitalOceanApiRequest({
          credentials: this.credentials,
          path: `/domains/${dns_zone.name}/records`,
        })).domain_records;

        for (const record of domain_records || []) {
          dns_record_rows.push({
            id: `${dns_zone.name},${record.id}` || '',
            name: record.name || '',
            data: [record.data] || [],
            recordType: record.type || '',
            managedZone: dns_zone.name || '',
          });
        }
      }
    }

    return {
      total: dns_record_rows.length,
      rows: dns_record_rows,
    };
  }

  get validators(): InputValidators<'dnsRecord'> {
    return {
      recordType: (input: string): string | true => {
        const allowed_record_types = ['A', 'AAAA', 'CAA', 'CNAME', 'MX', 'NS', 'SOA', 'SRV', 'TXT'];
        if (!allowed_record_types.includes(input)) {
          return `Record type must be one of ${allowed_record_types.join(', ')}.`;
        }
        return true;
      },

      ttl: (input?: number): string | true => {
        if (input && input < 30) {
          return 'Must be greater than or equal to 30.';
        }
        return true;
      },
    };
  }
}
