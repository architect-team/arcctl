import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.js';
import { ResourceModule } from '../../module.js';
import { DataDigitaloceanDomain } from '../.gen/providers/digitalocean/data-digitalocean-domain/index.js';
import { Record as DORecord } from '../.gen/providers/digitalocean/record/index.js';
import { DigitaloceanCredentials } from '../credentials.js';
import { DigitaloceanDnsRecordService } from '../services/dns-record.js';
import { Construct } from 'constructs';

export class DigitaloceanDnsRecordModule extends ResourceModule<
  'dnsRecord',
  DigitaloceanCredentials
> {
  dns_record: DORecord;
  outputs: ResourceOutputs['dnsRecord'];

  constructor(
    scope: Construct,
    id: string,
    inputs: ResourceInputs['dnsRecord'],
  ) {
    super(scope, id, inputs);

    if (Object.keys(inputs).length === 0) {
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
        name: inputs.dnsZone,
      });

      this.dns_record = new DORecord(this, 'dns-record', {
        name: inputs.subdomain,
        domain: dns_zone.name,
        type: inputs.recordType || '',
        value: inputs.content,
        ttl: inputs.ttl || 12 * 60 * 60,
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

  async genImports(
    credentials: DigitaloceanCredentials,
    resourceId: string,
  ): Promise<Record<string, string>> {
    let dns_record_match: ResourceOutputs['dnsRecord'] | undefined;
    if (!resourceId.includes(',')) {
      // import is required to be in the format specified here - https://registry.terraform.io/providers/digitalocean/digitalocean/latest/docs/resources/record#import
      const dns_record_service = new DigitaloceanDnsRecordService(credentials);
      const dns_records = await dns_record_service.list();
      dns_record_match = dns_records.rows.find(
        (r) =>
          r.name === resourceId && r.recordType === this.dns_record.typeInput,
      );
    }

    return {
      [this.getResourceRef(this.dns_record)]:
        dns_record_match?.id || resourceId,
    };
  }

  getDisplayNames(): Record<string, string> {
    return {
      [this.getResourceRef(this.dns_record)]: 'DNS Record',
    };
  }
}
