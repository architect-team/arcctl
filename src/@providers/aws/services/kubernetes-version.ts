import { ResourceOutputs } from '../../../@resources/index.js';
import { PagingOptions, PagingResponse } from '../../../utils/paging.js';
import { ResourceService } from '../../service.js';
import { AwsCredentials } from '../credentials.js';
import AwsUtils from '../utils.js';

export class AwsKubernetesVersionService extends ResourceService<
  'kubernetesVersion',
  AwsCredentials
> {
  constructor(private readonly credentials: AwsCredentials) {
    super();
  }

  async get(
    id: string,
  ): Promise<ResourceOutputs['kubernetesVersion'] | undefined> {
    const eks = AwsUtils.getEKS(this.credentials);
    const versionData = await eks.describeAddonVersions({}).promise();

    for (const addon of versionData?.addons || []) {
      for (const addonVersion of addon?.addonVersions || []) {
        for (const compatability of addonVersion.compatibilities || []) {
          if (compatability.clusterVersion === id) {
            return {
              id: compatability.clusterVersion,
              name: compatability.clusterVersion,
            };
          }
        }
      }
    }

    return undefined;
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['kubernetesVersion']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['kubernetesVersion']>> {
    const eks = AwsUtils.getEKS(this.credentials);
    const versionData = await eks.describeAddonVersions({}).promise();
    const versions: string[] = [];
    for (const addon of versionData?.addons || []) {
      for (const addonVersion of addon?.addonVersions || []) {
        for (const compatability of addonVersion.compatibilities || []) {
          if (
            compatability.clusterVersion &&
            !versions.includes(compatability.clusterVersion)
          ) {
            versions.push(compatability.clusterVersion || '');
          }
        }
      }
    }

    return {
      total: versions.length,
      rows: versions.map((version) => {
        return {
          id: version,
          name: version,
          type: 'kubernetesVersion',
        };
      }),
    };
  }
}
