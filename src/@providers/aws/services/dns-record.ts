import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { InputValidators } from '../../base.service.ts';
import { TerraformResourceService } from '../../terraform.service.ts';
import { AwsCredentials } from '../credentials.ts';
import { AwsDnsRecordModule } from '../modules/dns-record.ts';
import AwsUtils from '../utils.ts';
import { AwsProvider as TerraformAwsProvider } from '../.gen/providers/aws/provider/index.ts';
import { Construct } from 'constructs';

export class AwsDnsRecordService extends TerraformResourceService<'dnsRecord', AwsCredentials> {
  readonly terraform_version = '1.4.5';
  readonly construct = AwsDnsRecordModule;

  public configureTerraformProviders(scope: Construct): TerraformAwsProvider {
    return new TerraformAwsProvider(scope, 'aws', {
      accessKey: this.credentials.accessKeyId,
      secretKey: this.credentials.secretAccessKey,
    });
  }

  async get(id: string): Promise<ResourceOutputs['dnsRecord'] | undefined> {
    const [managed_zone, name, record_type] = id.split('_');

    try {
      const dns_record = await AwsUtils.getRoute53(this.credentials)
        .listResourceRecordSets({
          HostedZoneId: managed_zone,
          StartRecordName: name,
          StartRecordType: record_type,
        })
        .promise();

      if (dns_record.ResourceRecordSets.length === 0) {
        throw new Error(`DNS record set ${id} not found`);
      }

      const record_data = dns_record.ResourceRecordSets[0].ResourceRecords?.map((r) => r.Value);

      return {
        id: dns_record.ResourceRecordSets[0].Name || '',
        name: dns_record.ResourceRecordSets[0].Name || '',
        data: record_data || [],
        recordType: dns_record.ResourceRecordSets[0].Type || '',
        managedZone: managed_zone,
      };
    } catch {
      return undefined;
    }
  }

  async list(
    _filterOptions?: Partial<ResourceOutputs['dnsRecord']>,
    _pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['dnsRecord']>> {
    const dns_zones = await AwsUtils.getRoute53(this.credentials).listHostedZones().promise();

    const dns_record_rows: ResourceOutputs['dnsRecord'][] = [];
    for (const dns_zone of dns_zones.HostedZones || []) {
      const dns_records = await AwsUtils.getRoute53(this.credentials)
        .listResourceRecordSets({ HostedZoneId: dns_zone.Id })
        .promise();

      for (const record of dns_records.ResourceRecordSets || []) {
        const record_data = record.ResourceRecords?.map((r) => r.Value);
        const zone_id = dns_zone.Id.split('/')[2];

        dns_record_rows.push({
          id: `${zone_id}_${record.Name}_${record.Type}` || '',
          name: record.Name || '',
          data: record_data || [],
          recordType: record.Type || '',
          managedZone: zone_id || '',
        });
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
        const allowed_record_types = [
          'A',
          'AAAA',
          'CAA',
          'CNAME',
          'MX',
          'NAPTR',
          'NS',
          'PTR',
          'SOA',
          'SPF',
          'SRV',
          'TXT',
        ];

        if (!allowed_record_types.includes(input)) {
          return `Record type must be one of ${allowed_record_types.join(', ')}.`;
        }
        return true;
      },
    };
  }
}
