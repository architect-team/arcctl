import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.js';
import { ResourceModule } from '../../module.js';
import { DataAwsRoute53Zone } from '../.gen/providers/aws/data-aws-route53-zone/index.js';
import { Route53Record } from '../.gen/providers/aws/route53-record/index.js';
import { AwsCredentials } from '../credentials.js';
import { AwsDnsRecordService } from '../services/dns-record.js';
import { Construct } from 'constructs';

export class AwsDnsRecordModule extends ResourceModule<
  'dnsRecord',
  AwsCredentials
> {
  dns_record: Route53Record;
  outputs: ResourceOutputs['dnsRecord'];

  constructor(
    scope: Construct,
    id: string,
    inputs: ResourceInputs['dnsRecord'],
  ) {
    super(scope, id, inputs);

    if (Object.keys(inputs).length === 0) {
      // deleting
      this.dns_record = new Route53Record(this, 'dns-record', {
        name: 'deleting',
        type: 'A',
        zoneId: 'deleting',
        records: [],
      });
    } else {
      // creating
      this.dns_record = new Route53Record(this, 'dns-record', {
        name: inputs.subdomain,
        type: inputs.recordType,
        zoneId: inputs.dnsZone,
        ttl: inputs.ttl || 24 * 60 * 60,
        records: inputs.content.split(',').map((r) => r.trim()),
      });
    }

    this.outputs = {
      id: this.dns_record.name,
      name: this.dns_record.name,
      managedZone: this.dns_record.zoneId,
      recordType: this.dns_record.type,
      data: this.dns_record.records,
    };
  }

  async genImports(
    credentials: AwsCredentials,
    resourceId: string,
  ): Promise<Record<string, string>> {
    let dns_record_match: ResourceOutputs['dnsRecord'] | undefined;
    if (!resourceId.includes('_')) {
      // import is required to be in the format specified here - https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/route53_record#import
      const dns_record_service = new AwsDnsRecordService(credentials);
      const dns_records = await dns_record_service.list();
      dns_record_match = dns_records.rows.find(
        (r) =>
          r.name === `${resourceId}.` &&
          r.recordType === this.dns_record.typeInput,
      );
    }

    return {
      [this.getResourceRef(this.dns_record)]:
        dns_record_match?.name || resourceId,
    };
  }

  getDisplayNames(): Record<string, string> {
    return {
      [this.getResourceRef(this.dns_record)]: 'DNS Record',
    };
  }
}
