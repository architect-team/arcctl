import { Construct } from 'constructs';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule, ResourceModuleOptions } from '../../module.ts';
import { DataGoogleDnsManagedZone } from '../.gen/providers/google/data-google-dns-managed-zone/index.ts';
import { DnsRecordSet } from '../.gen/providers/google/dns-record-set/index.ts';
import { ProjectService } from '../.gen/providers/google/project-service/index.ts';
import { GoogleCloudCredentials } from '../credentials.ts';
import { GoogleCloudDnsRecordService } from '../services/dns-record.ts';

export class GoogleCloudDnsRecordModule extends ResourceModule<'dnsRecord', GoogleCloudCredentials> {
  dns_record: DnsRecordSet;
  outputs: ResourceOutputs['dnsRecord'];

  constructor(scope: Construct, options: ResourceModuleOptions<'dnsRecord', GoogleCloudCredentials>) {
    super(scope, options);

    const depends_on = [
      new ProjectService(this, 'dns-record-service', {
        service: 'dns.googleapis.com',
        disableOnDestroy: false,
      }),
    ];

    if (!this.inputs) { // deleting
      this.dns_record = new DnsRecordSet(this, 'dns-record', {
        name: 'deleting.',
        managedZone: 'deleting',
        type: 'deleting',
        rrdatas: [],
      });
    } else { // creating
      const dns_zone = new DataGoogleDnsManagedZone(this, 'dns-zone', {
        dependsOn: depends_on,
        name: this.inputs.dnsZone,
      });
      const name = this.inputs.subdomain.endsWith('.') ? this.inputs.subdomain : `${this.inputs.subdomain}.`;
      this.dns_record = new DnsRecordSet(this, 'dns-record', {
        dependsOn: depends_on,
        name: `${name}${dns_zone.dnsName}`,
        managedZone: dns_zone.name,
        type: this.inputs.recordType || '',
        rrdatas: this.inputs.content.split(' ') || '',
        ttl: this.inputs.ttl || 12 * 60 * 60,
      });
    }

    this.outputs = {
      id: this.dns_record.name,
      name: this.dns_record.name,
      managedZone: this.dns_record.managedZone,
      recordType: this.dns_record.type,
      data: this.dns_record.rrdatas,
    };
  }

  async genImports(
    resourceId: string,
  ): Promise<Record<string, string>> {
    let dns_record_match: ResourceOutputs['dnsRecord'] | undefined;
    if (!resourceId.includes('/')) { // import is required to be in the format specified here - https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/dns_record_set#import
      const dns_record_service = new GoogleCloudDnsRecordService(
        this.accountName,
        this.credentials,
        this.providerStore,
      );
      const dns_records = await dns_record_service.list();
      dns_record_match = dns_records.rows.find((r) =>
        r.name === resourceId && r.recordType === this.dns_record.typeInput
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
