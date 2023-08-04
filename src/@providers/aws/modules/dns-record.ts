import { Construct } from 'constructs';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule, ResourceModuleOptions } from '../../module.ts';
import { AwsProvider as TerraformAwsProvider } from '../.gen/providers/aws/provider/index.ts';
import { Route53Record } from '../.gen/providers/aws/route53-record/index.ts';
import { AwsCredentials } from '../credentials.ts';
import { AwsDnsRecordService } from '../services/dns-record.ts';

export class AwsDnsRecordModule extends ResourceModule<'dnsRecord', AwsCredentials> {
  dns_record: Route53Record;
  outputs: ResourceOutputs['dnsRecord'];

  constructor(scope: Construct, options: ResourceModuleOptions<'dnsRecord', AwsCredentials>) {
    super(scope, options);

    new TerraformAwsProvider(this, 'aws', {
      accessKey: this.credentials.accessKeyId,
      secretKey: this.credentials.secretAccessKey,
    });

    if (!this.inputs) {
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
        name: this.inputs.subdomain,
        type: this.inputs.recordType,
        zoneId: this.inputs.dnsZone,
        ttl: this.inputs.ttl || 24 * 60 * 60,
        records: this.inputs.content.split(',').map((r) => r.trim()),
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

  async genImports(resourceId: string): Promise<Record<string, string>> {
    let dns_record_match: ResourceOutputs['dnsRecord'] | undefined;
    if (!resourceId.includes('_')) {
      // import is required to be in the format specified here - https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/route53_record#import
      const dns_record_service = new AwsDnsRecordService(this.accountName, this.credentials, this.providerStore);
      const dns_records = await dns_record_service.list();
      dns_record_match = dns_records.rows.find(
        (r) => r.name === `${resourceId}.` && r.recordType === this.dns_record.typeInput,
      );
    }

    return {
      [this.getResourceRef(this.dns_record)]: dns_record_match?.name || resourceId,
    };
  }

  getDisplayNames(): Record<string, string> {
    return {
      [this.getResourceRef(this.dns_record)]: 'DNS Record',
    };
  }
}
