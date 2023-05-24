import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule } from '../../module.ts';
import { Route53Zone } from '../.gen/providers/aws/route53-zone/index.ts';
import { AwsCredentials } from '../credentials.ts';
import { AwsDnsZoneService } from '../services/dns-zone.ts';
import { Construct } from 'npm:constructs';

export class AwsDnsZoneModule extends ResourceModule<
  'dnsZone',
  AwsCredentials
> {
  dns_zone: Route53Zone;
  outputs: ResourceOutputs['dnsZone'];

  constructor(scope: Construct, id: string, inputs: ResourceInputs['dnsZone']) {
    super(scope, id, inputs);

    if (Object.keys(inputs).length === 0) {
      // deleting
      this.dns_zone = new Route53Zone(this, 'dns-zone', { name: id });
    } else {
      // creating
      this.dns_zone = new Route53Zone(this, 'dns-zone', { name: inputs.name });
    }

    this.outputs = {
      id: this.dns_zone.id,
      name: this.dns_zone.name,
      nameservers: this.dns_zone.nameServers,
    };
  }

  async genImports(
    credentials: AwsCredentials,
    resourceId: string,
  ): Promise<Record<string, string>> {
    let dns_zone_match: ResourceOutputs['dnsZone'] | undefined;
    if (resourceId.includes('.')) {
      // import is required to be in the format specified here - https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/route53_zone#import
      const dns_zone_service = new AwsDnsZoneService(credentials);
      const dns_zones = await dns_zone_service.list();
      dns_zone_match = dns_zones.rows.find((z) => z.id === `${resourceId}.`);
    }

    return {
      [this.getResourceRef(this.dns_zone)]: dns_zone_match?.id || resourceId,
    };
  }

  getDisplayNames(): Record<string, string> {
    return {
      [this.getResourceRef(this.dns_zone)]: 'DNS Zone',
    };
  }
}
