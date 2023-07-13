import { Auth, google } from 'googleapis';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { InputValidators } from '../../base.service.ts';
import { ProviderStore } from '../../store.ts';
import { TerraformResourceService } from '../../terraform.service.ts';
import { GoogleCloudCredentials } from '../credentials.ts';
import { GoogleCloudDeploymentModule } from '../modules/deployment.ts';
import GcpUtils from '../utils.ts';

export class GoogleCloudDeploymentService extends TerraformResourceService<'deployment', GoogleCloudCredentials> {
  private auth: Auth.GoogleAuth;

  readonly terraform_version = '1.4.5';
  readonly construct = GoogleCloudDeploymentModule;

  constructor(accountName: string, credentials: GoogleCloudCredentials, providerStore: ProviderStore) {
    super(accountName, credentials, providerStore);
    this.auth = new Auth.GoogleAuth({
      keyFile: credentials.serviceAccountCredentialsFile,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
  }

  async get(
    id: string,
  ): Promise<ResourceOutputs['deployment'] | undefined> {
    const [region, name] = id.split('/');
    try {
      const { data } = await google.run('v2').projects.locations.services.get({
        auth: this.auth,
        name: `projects/${this.credentials.project}/locations/${region}/services/${name}`,
      });

      return {
        id: data.uid || id,
        labels: {
          'name': data.name || id,
          'uri': data.uri || '',
        },
      };
    } catch {
      return undefined;
    }
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['deployment']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['deployment']>> {
    const regions = await GcpUtils.getProjectRegions(this.credentials, this.credentials.project);

    const service_promises = [];
    const service_results: ResourceOutputs['deployment'][] = [];

    for (const region of regions) {
      service_promises.push(
        (async () => {
          const { data } = await google.run('v2').projects.locations.services.list({
            auth: this.auth,
            parent: `projects/${this.credentials.project}/locations/${region}`,
          });
          const services = data.services || [];

          for (const service of services) {
            const name = service.name || 'unknown';
            let id = name;
            const name_parts = name.split('/');
            if (name_parts.length === 6) {
              // Full qualification: projects/{project_name}/locations/{region}/services/{name}
              id = `${name_parts[3]}/${name_parts[5]}`;
            }
            service_results.push({
              id,
              labels: { 'name': name },
            });
          }
        })(),
      );
    }

    await Promise.all(service_promises);

    return {
      total: service_results.length,
      rows: service_results,
    };
  }

  get validators(): InputValidators<'deployment'> {
    return {
      name: (input: string) => {
        if (!/[a-z]([\da-z-]*[\da-z])?/.test(input)) {
          return 'Name must comply with RFC1035: the first character must be a lowercase letter, and all following characters must be a dash, lowercase letter, or digit, except the last character, which cannot be a dash.';
        } else if (input.length > 63) {
          return 'Name must be no longer than 63 characters';
        }

        return true;
      },
      image: (input: string) => {
        if (!(input.includes('gcr.io') || input.includes('docker.pkg.dev') || input.includes('docker.io'))) {
          return 'Image host must be one of [region.]gcr.io, [region-]docker.pkg.dev or docker.io ';
        }

        return true;
      },
    };
  }
}
