import { Construct } from 'constructs';
import { google } from 'googleapis';
import { ProviderCredentials } from '../credentials.ts';
import { Provider, ProviderResources } from '../provider.ts';
import { CldctlTestResource } from '../tests.ts';
import { GoogleProvider as TerraformGoogleProvider } from './.gen/providers/google/provider/index.ts';
import { GoogleCloudCredentials, GoogleCloudCredentialsSchema } from './credentials.ts';
import { GoogleCloudDatabaseClusterService } from './services/database-cluster.ts';
import { GoogleCloudDatabaseSizeService } from './services/database-size.ts';
import { GoogleCloudDatabaseTypeService } from './services/database-type.ts';
import { GoogleCloudDatabaseVersionService } from './services/database-version.ts';
import { GoogleCloudDnsRecordService } from './services/dns-record.ts';
import { GoogleCloudDnsZoneService } from './services/dns-zone.ts';
import { GoogleCloudKubernetesClusterService } from './services/kubernetes-cluster.ts';
import { GoogleCloudKubernetesVersionService } from './services/kubernetes-version.ts';
import { GoogleCloudNodeSizeService } from './services/node-size.ts';
import { GoogleCloudRegionService } from './services/region.ts';
import { GoogleCloudVpcService } from './services/vpc.ts';
import { GoogleCloudDnsRecordTest } from './tests/dns-record.ts';
import { GoogleCloudDnsZoneTest } from './tests/dns-zone.ts';

export default class GoogleCloudProvider extends Provider<GoogleCloudCredentials> {
  readonly type = 'gcp';
  readonly terraform_version = '1.4.5';

  static readonly CredentialsSchema = GoogleCloudCredentialsSchema;

  public async testCredentials(): Promise<boolean> {
    const auth = new google.auth.GoogleAuth({
      keyFile: this.credentials.serviceAccountCredentialsFile,
      scopes: [
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/compute',
      ],
    });

    const regions = await google.compute('v1').regions.list({
      project: this.credentials.project,
      auth: auth,
    });
    return regions.status >= 200 && regions.status <= 300;
  }

  readonly resources: ProviderResources<GoogleCloudCredentials> = {
    region: new GoogleCloudRegionService(this.name, this.credentials, this.providerStore),
    nodeSize: new GoogleCloudNodeSizeService(this.name, this.credentials, this.providerStore),
    vpc: new GoogleCloudVpcService(this.name, this.credentials, this.providerStore),
    kubernetesVersion: new GoogleCloudKubernetesVersionService(
      this.name,
      this.credentials,
      this.providerStore,
    ),
    kubernetesCluster: new GoogleCloudKubernetesClusterService(
      this.name,
      this.credentials,
      this.providerStore,
    ),
    dnsZone: new GoogleCloudDnsZoneService(this.name, this.credentials, this.providerStore),
    dnsRecord: new GoogleCloudDnsRecordService(this.name, this.credentials, this.providerStore),
    databaseSize: new GoogleCloudDatabaseSizeService(this.name, this.credentials, this.providerStore),
    databaseType: new GoogleCloudDatabaseTypeService(this.name, this.credentials, this.providerStore),
    databaseVersion: new GoogleCloudDatabaseVersionService(this.name, this.credentials, this.providerStore),
    databaseCluster: new GoogleCloudDatabaseClusterService(this.name, this.credentials, this.providerStore),
  };

  public genTerraformProvider(scope: Construct): TerraformGoogleProvider {
    return new TerraformGoogleProvider(scope, this.name, {
      credentials: this.credentials.serviceAccountCredentialsFile,
      project: this.credentials.project,
    });
  }

  tests: CldctlTestResource<ProviderCredentials> = [
    new GoogleCloudDnsZoneTest(),
    new GoogleCloudDnsRecordTest(),
  ];
}
