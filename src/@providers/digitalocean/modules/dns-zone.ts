import { Construct } from 'constructs';
import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule } from '../../module.ts';
import { Domain } from '../.gen/providers/digitalocean/domain/index.ts';
import { DigitaloceanCredentials } from '../credentials.ts';

export class DigitaloceanDnsZoneModule extends ResourceModule<
  'dnsZone',
  DigitaloceanCredentials
> {
  dns_zone: Domain;
  outputs: ResourceOutputs['dnsZone'];

  constructor(scope: Construct, id: string, inputs: ResourceInputs['dnsZone']) {
    super(scope, id, inputs);

    if (Object.keys(inputs).length === 0) {
      // deleting
      this.dns_zone = new Domain(this, 'dns-zone', {
        name: id,
      });
    } else {
      // creating
      this.dns_zone = new Domain(this, 'dns-zone', {
        name: inputs.name,
      });
    }

    this.outputs = {
      id: this.dns_zone.id,
      name: this.dns_zone.name,
      nameservers: [], // not returned by api on create: https://docs.digitalocean.com/reference/api/api-reference/#operation/domains_create
    };
  }

  // deno-lint-ignore require-await
  async genImports(
    credentials: DigitaloceanCredentials,
    resourceId: string,
  ): Promise<Record<string, string>> {
    return {
      [this.getResourceRef(this.dns_zone)]: resourceId,
    };
  }

  getDisplayNames(): Record<string, string> {
    return {
      [this.getResourceRef(this.dns_zone)]: 'DNS Zone',
    };
  }
}
