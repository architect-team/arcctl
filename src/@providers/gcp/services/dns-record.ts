import { Auth, google } from 'googleapis';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ProviderStore } from '../../store.ts';
import { TerraformResourceService } from '../../terraform.service.ts';
import { GoogleCloudCredentials } from '../credentials.ts';
import { GoogleCloudDnsRecordModule } from '../modules/dns-record.ts';

export class GoogleCloudDnsRecordService extends TerraformResourceService<'dnsRecord', GoogleCloudCredentials> {
  private auth: Auth.GoogleAuth;
  readonly terraform_version = '1.4.5';
  readonly construct = GoogleCloudDnsRecordModule;

  constructor(accountName: string, credentials: GoogleCloudCredentials, providerStore: ProviderStore) {
    super(accountName, credentials, providerStore);
    this.auth = new Auth.GoogleAuth({
      keyFile: credentials.serviceAccountCredentialsFile,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
  }

  async get(id: string): Promise<ResourceOutputs['dnsRecord'] | undefined> {
    const [managed_zone, name, record_type] = id.split('/');

    try {
      const { data: dns_record } = await google.dns('v1').resourceRecordSets.get({
        project: this.credentials.project,
        auth: this.auth,
        name, // TODO: 83: validate the form "test-cldctl.architest.dev."
        managedZone: managed_zone,
        type: record_type,
      });

      return {
        id: dns_record.name || '',
        name: dns_record.name || '',
        data: dns_record.rrdatas || [],
        recordType: dns_record.type || '',
        managedZone: managed_zone,
      };
    } catch {
      return undefined;
    }
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['dnsRecord']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['dnsRecord']>> {
    const dns_zones = await google.dns('v1').managedZones.list({
      project: this.credentials.project,
      auth: this.auth,
    });

    const dns_record_rows: ResourceOutputs['dnsRecord'][] = [];
    for (const dns_zone of (dns_zones.data.managedZones || [])) {
      if (dns_zone.id) {
        const dns_zone_record_sets_response = await google.dns('v1').resourceRecordSets.list({
          project: this.credentials.project,
          auth: this.auth,
          managedZone: dns_zone.id,
        });

        for (const record of (dns_zone_record_sets_response.data.rrsets || [])) {
          dns_record_rows.push({
            id: `${dns_zone.name}/${record.name}/${record.type}` || '',
            name: record.name || '',
            data: record.rrdatas || [],
            recordType: record.type || '',
            managedZone: dns_zone.name || '',
          });
        }
      }
    }

    return {
      total: dns_record_rows.length,
      rows: dns_record_rows,
    };
  }
}
