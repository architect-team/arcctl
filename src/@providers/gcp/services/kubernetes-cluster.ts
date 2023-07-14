import { Construct } from 'constructs';
import { Auth, google } from 'googleapis';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { InputValidators, ResourcePresets } from '../../base.service.ts';
import { ProviderStore } from '../../store.ts';
import { TerraformResourceService } from '../../terraform.service.ts';
import { GoogleProvider as TerraformGoogleProvider } from '../.gen/providers/google/provider/index.ts';
import { GoogleCloudCredentials } from '../credentials.ts';
import { GoogleCloudKubernetesClusterModule } from '../modules/kubernetes-cluster.ts';

export class GoogleCloudKubernetesClusterService
  extends TerraformResourceService<'kubernetesCluster', GoogleCloudCredentials> {
  private auth: Auth.GoogleAuth;

  readonly terraform_version = '1.4.5';
  readonly construct = GoogleCloudKubernetesClusterModule;

  constructor(accountName: string, credentials: GoogleCloudCredentials, providerStore: ProviderStore) {
    super(accountName, credentials, providerStore);
    this.auth = new Auth.GoogleAuth({
      keyFile: credentials.serviceAccountCredentialsFile,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
  }

  public configureTerraformProviders(scope: Construct): TerraformGoogleProvider {
    return new TerraformGoogleProvider(scope, 'gcp', {
      project: this.credentials.project,
      credentials: this.credentials.serviceAccountCredentialsFile,
    });
  }

  async get(
    id: string,
  ): Promise<ResourceOutputs['kubernetesCluster'] | undefined> {
    try {
      const { data } = await google
        .container('v1')
        .projects.locations.clusters.get({
          clusterId: id,
          auth: this.auth,
          projectId: this.credentials.project,
        });

      return {
        id: data.id || '',
        name: data.name || '',
        kubernetesVersion: data.currentMasterVersion || '',
        vpc: data.network || '',
        description: data.description || undefined,
        configPath: '',
      };
    } catch {
      return undefined;
    }
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['kubernetesCluster']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['kubernetesCluster']>> {
    const { data } = await google
      .container('v1')
      .projects.locations.clusters.list({
        auth: this.auth,
        projectId: this.credentials.project,
        parent: `projects/${this.credentials.project}/locations/-`,
      });

    return {
      total: data.clusters?.length || 0,
      rows: (data.clusters || []).map((cluster) => ({
        id: `${cluster.location}/${cluster.name}`,
        name: cluster.name || '',
        vpc: cluster.network || '',
        kubernetesVersion: cluster.currentMasterVersion || '',
        description: cluster.description || undefined,
        configPath: '',
      })),
    };
  }

  get validators(): InputValidators<'kubernetesCluster'> {
    return {
      name: (input: string) => {
        if (!/[a-z]([\da-z-]*[\da-z])?/.test(input)) {
          return 'Name must comply with RFC1035: the first character must be a lowercase letter, and all following characters must be a dash, lowercase letter, or digit, except the last character, which cannot be a dash.';
        } else if (input.length > 63) {
          return 'Name must be no longer than 63 characters';
        }

        return true;
      },
      // TODO: nodePools.name validator
      // 'nodePools.name': (input: string) => {
      //   if (!/[a-z]([\da-z-]*[\da-z])?/.test(input)) {
      //     return '';
      //   } else if (input.length > 63) {
      //     return 'Name must be no longer than 63 characters';
      //   }

      //   return true;
      // },
    };
  }

  get presets(): ResourcePresets<'kubernetesCluster'> {
    return [
      {
        display: 'Minimum (Cheapest)',
        values: {
          nodePools: [
            {
              name: 'nodepool1',
              count: 1,
              nodeSize: 'e2-medium',
            },
          ],
        },
      },
      {
        display: 'Best Practice',
        values: {
          nodePools: [
            {
              name: 'nodepool1',
              count: 3,
              nodeSize: 'e2-standard-2',
            },
          ],
        },
      },
    ];
  }
}
