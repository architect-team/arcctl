import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ResourceService } from '../../service.ts';
import { DigitaloceanCredentials } from '../credentials.ts';
import { DigitaloceanDnsRecordModule } from '../modules/dns-record.ts';
import { createApiClient } from 'dots-wrapper';

export class DigitaloceanDnsRecordService extends ResourceService<
  'dnsRecord',
  DigitaloceanCredentials
> {
  private client: ReturnType<typeof createApiClient>;

  constructor(private readonly credentials: DigitaloceanCredentials) {
    super();
    this.client = createApiClient({ token: credentials.token });
  }

  async get(id: string): Promise<ResourceOutputs['dnsRecord'] | undefined> {
    const [managed_zone, record_id] = id.split('/');

    try {
      const {
        data: { domain_record },
      } = await this.client.domain.getDomainRecord({
        domain_name: managed_zone,
        domain_record_id: Number.parseInt(record_id),
      });

      return {
        id: domain_record.id.toString() || '',
        name: domain_record.name || '',
        data: [domain_record.data] || [],
        recordType: domain_record.type || '',
        managedZone: managed_zone,
      };
    } catch {
      return undefined;
    }
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['dnsRecord']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['dnsRecord']>> {
    const {
      data: { domains },
    } = await this.client.domain.listDomains({});

    const dns_record_rows: ResourceOutputs['dnsRecord'][] = [];
    for (const dns_zone of domains || []) {
      if (dns_zone.name) {
        const {
          data: { domain_records },
        } = await this.client.domain.listDomainRecords({
          domain_name: dns_zone.name,
        });

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

  allowed_record_types = [
    'A',
    'AAAA',
    'CAA',
    'CNAME',
    'MX',
    'NS',
    'SOA',
    'SRV',
    'TXT',
  ];

  manage = {
    validators: {
      name: (input: string): string | true => {
        if (!/^[\w-]*[\dA-Za-z]$/.test(input)) {
          return `Name must contain only contain upper and lowercase letters, numbers, dashes, and underscores and can't end with a dash or underscore.`;
        }
        return true;
      },

      recordType: (input: string): string | true => {
        if (!this.allowed_record_types.includes(input)) {
          return `Record type must be one of ${this.allowed_record_types.join(
            ', ',
          )}.`;
        }
        return true;
      },

      ttl: (input?: number): string | true => {
        if (input && input < 30) {
          return 'Must be greater than or equal to 30.';
        }
        return true;
      },
    },

    module: DigitaloceanDnsRecordModule,
  };
}
