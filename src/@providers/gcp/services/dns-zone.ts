import { Auth, google } from 'googleapis';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { InputValidators } from '../../base.service.ts';
import { ProviderStore } from '../../store.ts';
import { TerraformResourceService } from '../../terraform.service.ts';
import { GoogleCloudCredentials } from '../credentials.ts';
import { GoogleCloudDnsZoneModule } from '../modules/dns-zone.ts';

export class GoogleCloudDnsZoneService extends TerraformResourceService<'dnsZone', GoogleCloudCredentials> {
  private auth: Auth.GoogleAuth;

  readonly terraform_version = '1.4.5';
  readonly construct = GoogleCloudDnsZoneModule;

  constructor(accountName: string, credentials: GoogleCloudCredentials, providerStore: ProviderStore) {
    super(accountName, credentials, providerStore);
    this.auth = new Auth.GoogleAuth({
      keyFile: credentials.serviceAccountCredentialsFile,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
  }

  async get(id: string): Promise<ResourceOutputs['dnsZone'] | undefined> {
    try {
      const { data: dns_zone } = await google.dns('v1').managedZones.get({
        project: this.credentials.project,
        auth: this.auth,
        managedZone: id, // managed zone name OR id
      });

      return {
        id: dns_zone.id || '',
        name: dns_zone.name || '',
        nameservers: Array.isArray(dns_zone.nameServers) ? dns_zone.nameServers : [dns_zone.nameServers || ''],
      };
    } catch {
      return undefined;
    }
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['dnsZone']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['dnsZone']>> {
    const dns_zones = await google.dns('v1').managedZones.list({
      project: this.credentials.project,
      auth: this.auth,
    });

    return {
      total: dns_zones.data.managedZones?.length || 0,
      rows: (dns_zones.data.managedZones || []).map((dns_zone) => {
        return {
          type: 'dnsZone',
          id: dns_zone.name || '', // this needs to be the name, not the ID, to facilitate dnsRecord creation
          name: dns_zone.dnsName || '',
          nameservers: Array.isArray(dns_zone.nameServers) ? dns_zone.nameServers : [dns_zone.nameServers || ''],
        };
      }),
    };
  }

  get validators(): InputValidators<'dnsZone'> {
    return {
      name: (input: string): string | true => {
        if (!/^\*?\S+\.\S+$/.test(input)) {
          return 'Name must have more than two parts separated by periods and can have an optional asterisk at the beginning. Whitespace characters are not allowed.';
        }
        return true;
      },
    };
  }
}
