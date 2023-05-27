import { Provider } from '../provider.js';
import { CldctlTestResource } from '../tests.js';
import { DigitaloceanProvider as TerraformDigitaloceanProvider } from './.gen/providers/digitalocean/provider/index.js';
import {
  DigitaloceanCredentials,
  DigitaloceanCredentialsSchema,
} from './credentials.js';
import { DigitaloceanDatabaseSchemaService } from './services/database-schema.js';
import { DigitaloceanDatabaseSizeService } from './services/database-size.js';
import { DigitaloceanDatabaseTypeService } from './services/database-type.js';
import { DigitaloceanDatabaseUserService } from './services/database-user.js';
import { DigitaloceanDatabaseVersionService } from './services/database-version.js';
import { DigitaloceanDatabaseService } from './services/database.js';
import { DigitaloceanDnsRecordService } from './services/dns-record.js';
import { DigitaloceanDnsZoneService } from './services/dns-zone.js';
import { DigitaloceanKubernetesClusterService } from './services/kubernetes-cluster.js';
import { DigitaloceanKubernetesVersionService } from './services/kubernetes-version.js';
import { DigitaloceanNodeSizeService } from './services/node-size.js';
import { DigitaloceanRegionService } from './services/region.js';
import { DigitaloceanVpcService } from './services/vpc.js';
import { DigitalOceanDatabaseTest } from './tests/database.js';
import { DigitalOceanDnsRecordTest } from './tests/dns-record.js';
import { DigitalOceanDnsZoneTest } from './tests/dns-zone.js';
import { DigitalOceanVpcTest } from './tests/vpc.js';
import { Construct } from 'constructs';
import { createApiClient } from 'dots-wrapper';

export default class DigitaloceanProvider extends Provider<DigitaloceanCredentials> {
  readonly type = 'digitalocean';
  readonly terraform_version = '1.2.9';

  static readonly CredentialsSchema = DigitaloceanCredentialsSchema;

  readonly resources = {
    region: new DigitaloceanRegionService(this.credentials),
    vpc: new DigitaloceanVpcService(this.credentials),
    nodeSize: new DigitaloceanNodeSizeService(this.credentials),
    kubernetesVersion: new DigitaloceanKubernetesVersionService(
      this.credentials,
    ),
    kubernetesCluster: new DigitaloceanKubernetesClusterService(
      this.credentials,
    ),
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

  public configureTerraformProviders(
    scope: Construct,
  ): TerraformDigitaloceanProvider {
    return new TerraformDigitaloceanProvider(scope, this.name, {
      token: this.credentials.token,
    });
  }

  tests: CldctlTestResource<Partial<DigitaloceanCredentials>> = [
    new DigitalOceanVpcTest(),
    new DigitalOceanDatabaseTest(),
    new DigitalOceanDnsZoneTest(),
    new DigitalOceanDnsRecordTest(),
  ];
}
