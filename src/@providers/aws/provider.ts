import { AwsDnsZoneTest } from '../aws/tests/dns-zone.js';
import { ProviderCredentials } from '../credentials.js';
import { Provider, ProviderResources } from '../provider.js';
import { CldctlTestResource } from '../tests.js';
import { AwsProvider as TerraformAwsProvider } from './.gen/providers/aws/provider/index.js';
import { AwsCredentials, AwsCredentialsSchema } from './credentials.js';
import { AwsDatabaseSizeService } from './services/database-size.js';
import { AwsDatabaseTypeService } from './services/database-type.js';
import { AwsDatabaseVersionService } from './services/database-version.js';
import { AwsDatabaseService } from './services/database.js';
import { AwsDnsRecordService } from './services/dns-record.js';
import { AwsDnsZoneService } from './services/dns-zone.js';
import { AwsKubernetesClusterService } from './services/kubernetes-cluster.js';
import { AwsKubernetesVersionService } from './services/kubernetes-version.js';
import { AwsNodeSizeService } from './services/node-size.js';
import { AwsRegionService } from './services/region.js';
import { AwsVpcService } from './services/vpc.js';
import { AwsDnsRecordTest } from './tests/dns-record.js';
import AwsUtils from './utils.js';
import { Construct } from 'constructs';

export default class AwsProvider extends Provider<AwsCredentials> {
  readonly type = 'aws';
  readonly terraform_version = '1.4.6';

  static readonly CredentialsSchema = AwsCredentialsSchema;

  readonly resources: ProviderResources<AwsCredentials> = {
    region: new AwsRegionService(this.credentials),
    vpc: new AwsVpcService(this.credentials),
    kubernetesVersion: new AwsKubernetesVersionService(this.credentials),
    nodeSize: new AwsNodeSizeService(this.credentials),
    kubernetesCluster: new AwsKubernetesClusterService(this.credentials),
    databaseType: new AwsDatabaseTypeService(this.credentials),
    databaseVersion: new AwsDatabaseVersionService(this.credentials),
    databaseSize: new AwsDatabaseSizeService(this.credentials),
    database: new AwsDatabaseService(this.credentials),
    dnsZone: new AwsDnsZoneService(this.credentials),
    dnsRecord: new AwsDnsRecordService(this.credentials),
  };

  public async testCredentials(): Promise<boolean> {
    try {
      await AwsUtils.getEC2(this.credentials).describeInstanceTypes().promise();
      return true;
    } catch (_) {}
    return false;
  }

  public configureTerraformProviders(scope: Construct): TerraformAwsProvider {
    return new TerraformAwsProvider(scope, this.name, {
      accessKey: this.credentials.accessKeyId,
      secretKey: this.credentials.secretAccessKey,
    });
  }

  tests: CldctlTestResource<ProviderCredentials> = [
    new AwsDnsZoneTest(),
    new AwsDnsRecordTest(),
  ];
}
