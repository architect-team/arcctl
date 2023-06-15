import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { InputValidators } from '../../base.service.ts';
import { TerraformResourceService } from '../../terraform.service.ts';
import { AwsCredentials } from '../credentials.ts';
import { AwsDnsZoneModule } from '../modules/dns-zone.ts';
import AwsUtils from '../utils.ts';
import { AwsProvider as TerraformAwsProvider } from '../.gen/providers/aws/provider/index.ts';
import { Construct } from 'constructs';

export class AwsDnsZoneService extends TerraformResourceService<'dnsZone', AwsCredentials> {
  readonly terraform_version = '1.4.5';
  readonly construct = AwsDnsZoneModule;

  public configureTerraformProviders(scope: Construct): TerraformAwsProvider {
    return new TerraformAwsProvider(scope, 'aws', {
      accessKey: this.credentials.accessKeyId,
      secretKey: this.credentials.secretAccessKey,
    });
  }

  async get(id: string): Promise<ResourceOutputs['dnsZone'] | undefined> {
    try {
      const dns_zone = await AwsUtils.getRoute53(this.credentials).getHostedZone({ Id: id }).promise();

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
    _filterOptions?: Partial<ResourceOutputs['dnsZone']>,
    _pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['dnsZone']>> {
    const dns_zones = await AwsUtils.getRoute53(this.credentials).listHostedZones().promise();

    return {
      total: dns_zones.HostedZones?.length || 0,
      rows: (dns_zones.HostedZones || []).map((dns_zone) => ({
        id: dns_zone.Id,
        name: dns_zone.Name,
        nameservers: [], // not included in response https://docs.aws.amazon.com/Route53/latest/APIReference/API_ListHostedZones.html
      })),
    };
  }

  get validators(): InputValidators<'dnsZone'> {
    return {
      name: (input: string): string | true => {
        if (!/^\*?\S+\.\S+\.$/.test(input)) {
          return 'Name must end with a period, have more than two parts separated by periods, and can have an optional asterisk at the beginning. Whitespace characters are not allowed.';
        }
        return true;
      },
    };
  }
}
