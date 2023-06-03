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
import { createApiClient } from 'dots-wrapper';

export default class DigitaloceanProvider extends Provider<DigitaloceanCredentials> {
  readonly type = 'digitalocean';
  readonly terraform_version = '1.2.9';

  static readonly CredentialsSchema = DigitaloceanCredentialsSchema;

  readonly resources = {
    region: new DigitaloceanRegionService(this.credentials),
    vpc: new DigitaloceanVpcService(this.credentials),
    nodeSize: new DigitaloceanNodeSizeService(this.credentials),
    kubernetesVersion: new DigitaloceanKubernetesVersionService(this.credentials),
    kubernetesCluster: new DigitaloceanKubernetesClusterService(this.credentials),
    database: new DigitaloceanDatabaseService(this.credentials),
    databaseSize: new DigitaloceanDatabaseSizeService(this.credentials),
    databaseType: new DigitaloceanDatabaseTypeService(this.credentials),
    databaseSchema: new DigitaloceanDatabaseSchemaService(this.credentials),
    databaseUser: new DigitaloceanDatabaseUserService(this.credentials),
    databaseVersion: new DigitaloceanDatabaseVersionService(this.credentials),
    dnsZone: new DigitaloceanDnsZoneService(this.credentials),
    dnsRecord: new DigitaloceanDnsRecordService(this.credentials),
  };

  public async testCredentials(): Promise<boolean> {
    try {
      const dots = createApiClient({ token: this.credentials.token });
      await dots.account.getAccount();
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
