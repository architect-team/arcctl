import { Construct } from 'constructs';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule, ResourceModuleOptions } from '../../module.ts';
import { Domain } from '../.gen/providers/digitalocean/domain/index.ts';
import { DigitaloceanCredentials } from '../credentials.ts';

export class DigitaloceanDnsZoneModule extends ResourceModule<'dnsZone', DigitaloceanCredentials> {
  dns_zone: Domain;
  outputs: ResourceOutputs['dnsZone'];

  constructor(scope: Construct, options: ResourceModuleOptions<'dnsZone'>) {
    super(scope, options);

    if (!this.inputs) {
      // deleting
      this.dns_zone = new Domain(this, 'dns-zone', {
        name: 'unknown',
      });
    } else {
      // creating
      this.dns_zone = new Domain(this, 'dns-zone', {
        name: this.inputs.name,
      });
    }

    this.outputs = {
      id: this.dns_zone.id,
      name: this.dns_zone.name,
      nameservers: [], // not returned by api on create: https://docs.digitalocean.com/reference/api/api-reference/#operation/domains_create
    };
  }

  genImports(_credentials: DigitaloceanCredentials, resourceId: string): Promise<Record<string, string>> {
    return Promise.resolve({
      [this.getResourceRef(this.dns_zone)]: resourceId,
    });
  }

  getDisplayNames(): Record<string, string> {
    return {
      [this.getResourceRef(this.dns_zone)]: 'DNS Zone',
    };
  }
}
