import { Construct } from 'constructs';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule, ResourceModuleOptions } from '../../module.ts';
import { DnsManagedZone } from '../.gen/providers/google/dns-managed-zone/index.ts';
import { ProjectService } from '../.gen/providers/google/project-service/index.ts';
import { GoogleCloudCredentials } from '../credentials.ts';

import GcpUtils from '../utils.ts';
export class GoogleCloudDnsZoneModule extends ResourceModule<'dnsZone', GoogleCloudCredentials> {
  dns_zone: DnsManagedZone;
  outputs: ResourceOutputs['dnsZone'];

  constructor(scope: Construct, options: ResourceModuleOptions<'dnsZone', GoogleCloudCredentials>) {
    super(scope, options);

    GcpUtils.configureProvider(this);

    if (!this.inputs) { // deleting
      this.dns_zone = new DnsManagedZone(this, 'dns-zone', {
        name: 'unknown',
        dnsName: 'unknown',
      });
    } else { // creating
      if (!this.inputs.name.endsWith('.')) {
        this.inputs.name += '.';
      }
      this.dns_zone = new DnsManagedZone(this, 'dns-zone', {
        dependsOn: [
          new ProjectService(this, 'dns-zone-service', {
            service: 'dns.googleapis.com',
            disableOnDestroy: false,
          }),
        ],
        name: this.inputs.name.replaceAll('.', '-').slice(0, -1),
        dnsName: this.inputs.name,
      });
    }

    this.outputs = {
      id: this.dns_zone.name,
      name: this.dns_zone.dnsName,
      nameservers: this.dns_zone.nameServers,
    };
  }

  async genImports(
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
