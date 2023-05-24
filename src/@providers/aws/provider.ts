import { AwsDnsZoneTest } from '../aws/tests/dns-zone.ts';
import { ProviderCredentials } from '../credentials.ts';
import { Provider, ProviderResources } from '../provider.ts';
import { CldctlTestResource } from '../tests.ts';
import { AwsProvider as TerraformAwsProvider } from './.gen/providers/aws/provider/index.ts';
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
import { Construct } from 'npm:constructs';

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
