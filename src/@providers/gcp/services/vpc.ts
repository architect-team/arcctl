import { Construct } from 'constructs';
import { Auth, google } from 'https://esm.sh/v124/googleapis@118.0.0';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { InputValidators } from '../../base.service.ts';
import { ProviderStore } from '../../store.ts';
import { TerraformResourceService } from '../../terraform.service.ts';
import { GoogleProvider as TerraformGoogleProvider } from '../.gen/providers/google/provider/index.ts';
import { GoogleCloudCredentials } from '../credentials.ts';
import { GoogleCloudVpcModule } from '../modules/vpc.ts';

export class GoogleCloudVpcService extends TerraformResourceService<'vpc', GoogleCloudCredentials> {
  private auth: Auth.GoogleAuth;
  readonly terraform_version = '1.4.5';
  readonly construct = GoogleCloudVpcModule;

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

  async get(id: string): Promise<ResourceOutputs['vpc'] | undefined> {
    try {
      const { data: network } = await google.compute('v1').networks.get({
        project: this.credentials.project,
        auth: this.auth,
        network: id,
      });
      return {
        id: network.id || '',
        name: network.name || '',
        description: network.description || '',
        region: '',
      };
    } catch {
      return undefined;
    }
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['vpc']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['vpc']>> {
    const networks = await google.compute('v1').networks.list({
      project: this.credentials.project,
      auth: this.auth,
    });

    return {
      total: networks.data.items?.length || 0,
      rows: (networks.data.items || []).map((network) => {
        return {
          type: 'vpc',
          id: network.name || '',
          name: network.name || '',
          description: network.description || '',
          region: '',
        };
      }),
    };
  }

  get validators(): InputValidators<'vpc'> {
    return {
      name: (input: string) => {
        if (!/[a-z]([\da-z-]*[\da-z])?/.test(input)) {
          return 'Name must comply with RFC1035: the first character must be a lowercase letter, and all following characters must be a dash, lowercase letter, or digit, except the last character, which cannot be a dash.';
        } else if (input.length > 63) {
          return 'Name must be no longer than 63 characters';
        }

        return true;
      },
    };
  }
}
