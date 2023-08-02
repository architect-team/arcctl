import { Construct } from 'constructs';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule, ResourceModuleOptions } from '../../module.ts';
import { AwsProvider as TerraformAwsProvider } from '../.gen/providers/aws/provider/index.ts';
import { Route53Zone } from '../.gen/providers/aws/route53-zone/index.ts';
import { AwsCredentials } from '../credentials.ts';
import { AwsDnsZoneService } from '../services/dns-zone.ts';

export class AwsDnsZoneModule extends ResourceModule<'dnsZone', AwsCredentials> {
  dns_zone: Route53Zone;
  outputs: ResourceOutputs['dnsZone'];

  constructor(scope: Construct, options: ResourceModuleOptions<'dnsZone', AwsCredentials>) {
    super(scope, options);

    new TerraformAwsProvider(this, 'aws', {
      accessKey: this.credentials.accessKeyId,
      secretKey: this.credentials.secretAccessKey,
    });

    this.dns_zone = new Route53Zone(this, 'zone', {
      name: this.inputs?.name || 'unknown',
    });

    this.outputs = {
      id: this.dns_zone.zoneId,
      name: this.dns_zone.name,
      nameservers: this.dns_zone.nameServers,
    };
  }

  async genImports(resourceId: string, credentials?: AwsCredentials): Promise<Record<string, string>> {
    if (!credentials) {
      throw new Error('Credentials required');
    }
    let dns_zone_match: ResourceOutputs['dnsZone'] | undefined;
    if (resourceId.includes('.')) {
      // import is required to be in the format specified here - https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/route53_zone#import
      const dns_zone_service = new AwsDnsZoneService(this.accountName, credentials, this.providerStore);
      const dns_zones = await dns_zone_service.list();
      dns_zone_match = dns_zones.rows.find((z) => z.name === `${resourceId}.`);
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
