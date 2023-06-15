import { Construct } from 'constructs';
import { AwsDnsZoneTest } from '../aws/tests/dns-zone.ts';
import { ProviderCredentials } from '../credentials.ts';
import { Provider } from '../provider.ts';
import { CldctlTestResource } from '../tests.ts';
import { AwsCredentials, AwsCredentialsSchema } from './credentials.ts';
import { AwsDatabaseSizeService } from './services/database-size.ts';
import { AwsDatabaseTypeService } from './services/database-type.ts';
import { AwsDatabaseVersionService } from './services/database-version.ts';
import { AwsDatabaseService } from './services/database.ts';
import { AwsDnsRecordService } from './services/dns-record.ts';
import { AwsDnsZoneService } from './services/dns-zone.ts';
import { AwsKubernetesClusterService } from './services/kubernetes-cluster.ts';
import { AwsKubernetesVersionService } from './services/kubernetes-version.ts';
import { AwsNodeSizeService } from './services/node-size.ts';
import { AwsRegionService } from './services/region.ts';
import { AwsVpcService } from './services/vpc.ts';
import { AwsDnsRecordTest } from './tests/dns-record.ts';
import AwsUtils from './utils.ts';

export default class AwsProvider extends Provider<AwsCredentials> {
  readonly type = 'aws';

  static readonly CredentialsSchema = AwsCredentialsSchema;

  readonly resources = {
    region: new AwsRegionService(this.name, this.credentials, this.providerStore),
    vpc: new AwsVpcService(this.name, this.credentials, this.providerStore),
    kubernetesVersion: new AwsKubernetesVersionService(this.name, this.credentials, this.providerStore),
    nodeSize: new AwsNodeSizeService(this.name, this.credentials, this.providerStore),
    kubernetesCluster: new AwsKubernetesClusterService(this.name, this.credentials, this.providerStore),
    databaseType: new AwsDatabaseTypeService(this.name, this.credentials, this.providerStore),
    databaseVersion: new AwsDatabaseVersionService(this.name, this.credentials, this.providerStore),
    databaseSize: new AwsDatabaseSizeService(this.name, this.credentials, this.providerStore),
    database: new AwsDatabaseService(this.name, this.credentials, this.providerStore),
    dnsZone: new AwsDnsZoneService(this.name, this.credentials, this.providerStore),
    dnsRecord: new AwsDnsRecordService(this.name, this.credentials, this.providerStore),
  };

  public async testCredentials(): Promise<boolean> {
    try {
      await AwsUtils.getEC2(this.credentials).describeInstanceTypes().promise();
      return true;
      // deno-lint-ignore no-empty
    } catch (_) {}
    return false;
  }

  tests: CldctlTestResource<ProviderCredentials> = [new AwsDnsZoneTest(), new AwsDnsRecordTest()];
}
