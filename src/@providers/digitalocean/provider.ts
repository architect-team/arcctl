import { Provider } from '../provider.ts';
import { CldctlTestResource } from '../tests.ts';
import { DigitaloceanCredentials, DigitaloceanCredentialsSchema } from './credentials.ts';
import { DigitaloceanDatabaseSchemaService } from './services/database-schema.ts';
import { DigitaloceanDatabaseSizeService } from './services/database-size.ts';
import { DigitaloceanDatabaseTypeService } from './services/database-type.ts';
import { DigitaloceanDatabaseUserService } from './services/database-user.ts';
import { DigitaloceanDatabaseVersionService } from './services/database-version.ts';
import { DigitaloceanDatabaseService } from './services/database.ts';
import { DigitaloceanDnsRecordService } from './services/dns-record.ts';
import { DigitaloceanDnsZoneService } from './services/dns-zone.ts';
import { DigitaloceanKubernetesClusterService } from './services/kubernetes-cluster.ts';
import { DigitaloceanKubernetesVersionService } from './services/kubernetes-version.ts';
import { DigitaloceanNodeSizeService } from './services/node-size.ts';
import { DigitaloceanRegionService } from './services/region.ts';
import { DigitaloceanVpcService } from './services/vpc.ts';
import { DigitalOceanDatabaseTest } from './tests/database.ts';
import { DigitalOceanDnsRecordTest } from './tests/dns-record.ts';
import { DigitalOceanDnsZoneTest } from './tests/dns-zone.ts';
import { DigitalOceanVpcTest } from './tests/vpc.ts';
import { digitalOceanApiRequest } from './utils.ts';

export default class DigitaloceanProvider extends Provider<DigitaloceanCredentials> {
  readonly type = 'digitalocean';

  static readonly CredentialsSchema = DigitaloceanCredentialsSchema;

  readonly resources = {
    region: new DigitaloceanRegionService(this.name, this.credentials, this.providerStore),
    vpc: new DigitaloceanVpcService(this.name, this.credentials, this.providerStore),
    nodeSize: new DigitaloceanNodeSizeService(this.name, this.credentials, this.providerStore),
    kubernetesVersion: new DigitaloceanKubernetesVersionService(this.name, this.credentials, this.providerStore),
    kubernetesCluster: new DigitaloceanKubernetesClusterService(this.name, this.credentials, this.providerStore),
    database: new DigitaloceanDatabaseService(this.name, this.credentials, this.providerStore),
    databaseSize: new DigitaloceanDatabaseSizeService(this.name, this.credentials, this.providerStore),
    databaseType: new DigitaloceanDatabaseTypeService(this.name, this.credentials, this.providerStore),
    databaseSchema: new DigitaloceanDatabaseSchemaService(this.name, this.credentials, this.providerStore),
    databaseUser: new DigitaloceanDatabaseUserService(this.name, this.credentials, this.providerStore),
    databaseVersion: new DigitaloceanDatabaseVersionService(this.name, this.credentials, this.providerStore),
    dnsZone: new DigitaloceanDnsZoneService(this.name, this.credentials, this.providerStore),
    dnsRecord: new DigitaloceanDnsRecordService(this.name, this.credentials, this.providerStore),
  };

  public async testCredentials(): Promise<boolean> {
    try {
      await digitalOceanApiRequest({
        credentials: this.credentials,
        path: '/account',
      });
    } catch {
      return false;
    }
    return true;
  }

  tests: CldctlTestResource<Partial<DigitaloceanCredentials>> = [
    new DigitalOceanVpcTest(),
    new DigitalOceanDatabaseTest(),
    new DigitalOceanDnsZoneTest(),
    new DigitalOceanDnsRecordTest(),
  ];
}
