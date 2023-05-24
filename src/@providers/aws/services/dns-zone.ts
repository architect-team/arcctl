import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ResourceService } from '../../service.ts';
import { AwsCredentials } from '../credentials.ts';
import { AwsDnsZoneModule } from '../modules/dns-zone.ts';
import AwsUtils from '../utils.ts';

export class AwsDnsZoneService extends ResourceService<
  'dnsZone',
  AwsCredentials
> {
  constructor(private readonly credentials: AwsCredentials) {
    super();
  }

  async get(id: string): Promise<ResourceOutputs['dnsZone'] | undefined> {
    try {
      const dns_zone = await AwsUtils.getRoute53(this.credentials)
        .getHostedZone({ Id: id })
        .promise();

      return {
        id: dns_zone.HostedZone.Id || '',
        name: dns_zone.HostedZone.Name,
        nameservers: dns_zone.DelegationSet?.NameServers || [],
      };
    } catch {
      return undefined;
    }
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['dnsZone']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['dnsZone']>> {
    const dns_zones = await AwsUtils.getRoute53(this.credentials)
      .listHostedZones()
      .promise();

    return {
      total: dns_zones.HostedZones?.length || 0,
      rows: (dns_zones.HostedZones || []).map((dns_zone) => ({
        id: dns_zone.Id,
        name: dns_zone.Name,
        nameservers: [], // not included in response https://docs.aws.amazon.com/Route53/latest/APIReference/API_ListHostedZones.html
      })),
    };
  }

  manage = {
    validators: {
      dnsName: (input: string): string | true => {
        if (!/^\*?\S+\.\S+\.$/.test(input)) {
          return 'DNS name must end with a period, have more than two parts separated by periods, and can have an optional asterisk at the beginning. Whitespace characters are not allowed.';
        }
        return true;
      },

      name: (input: string): string | true => {
        if (!/^\*?\S+\.\S+\.$/.test(input)) {
          return 'Name must end with a period, have more than two parts separated by periods, and can have an optional asterisk at the beginning. Whitespace characters are not allowed.';
        }
        return true;
      },
    },

    module: AwsDnsZoneModule,
  };
}
