import { ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule, ResourceModuleOptions } from '../../module.ts';
import { DataDigitaloceanDomain } from '../.gen/providers/digitalocean/data-digitalocean-domain/index.ts';
import { Record as DORecord } from '../.gen/providers/digitalocean/record/index.ts';
import { DigitaloceanCredentials } from '../credentials.ts';
import { DigitaloceanDnsRecordService } from '../services/dns-record.ts';
import { Construct } from 'constructs';

export class DigitaloceanDnsRecordModule extends ResourceModule<'dnsRecord', DigitaloceanCredentials> {
  dns_record: DORecord;
  outputs: ResourceOutputs['dnsRecord'];

  constructor(scope: Construct, options: ResourceModuleOptions<'dnsRecord'>) {
    super(scope, options);

    if (!this.inputs) {
      // deleting
      this.dns_record = new DORecord(this, 'dns-record', {
        name: 'deleting.',
        domain: 'deleting',
        type: 'A',
        value: 'deleting',
      });
    } else {
      // creating
      const dns_zone = new DataDigitaloceanDomain(this, 'dns-zone', {
        name: this.inputs.dnsZone,
      });

      this.dns_record = new DORecord(this, 'dns-record', {
        name: this.inputs.subdomain,
        domain: dns_zone.name,
        type: this.inputs.recordType || '',
        value: this.inputs.content,
        ttl: this.inputs.ttl || 12 * 60 * 60,
      });
    }

    this.outputs = {
      id: this.dns_record.name,
      name: this.dns_record.name,
      managedZone: this.dns_record.domain,
      recordType: this.dns_record.type,
      data: [this.dns_record.value],
    };
  }

  async genImports(credentials: DigitaloceanCredentials, resourceId: string): Promise<Record<string, string>> {
    let dns_record_match: ResourceOutputs['dnsRecord'] | undefined;
    if (!resourceId.includes(',')) {
      // import is required to be in the format specified here - https://registry.terraform.io/providers/digitalocean/digitalocean/latest/docs/resources/record#import
      const dns_record_service = new DigitaloceanDnsRecordService(credentials);
      const dns_records = await dns_record_service.list();
      dns_record_match = dns_records.rows.find(
        (r) => r.name === resourceId && r.recordType === this.dns_record.typeInput,
      );
    }

    return {
      [this.getResourceRef(this.dns_record)]: dns_record_match?.id || resourceId,
    };
  }

  getDisplayNames(): Record<string, string> {
    return {
      [this.getResourceRef(this.dns_record)]: 'DNS Record',
    };
  }
}
