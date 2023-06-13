import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ResourceService } from '../../base.service.ts';
import { AwsCredentials } from '../credentials.ts';
import AwsUtils from '../utils.ts';

export class AwsKubernetesVersionService extends ResourceService<'kubernetesVersion', AwsCredentials> {
  async get(id: string): Promise<ResourceOutputs['kubernetesVersion'] | undefined> {
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
    _filterOptions?: Partial<ResourceOutputs['kubernetesVersion']>,
    _pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['kubernetesVersion']>> {
    const eks = AwsUtils.getEKS(this.credentials);
    const versionData = await eks.describeAddonVersions({}).promise();
    const versions: string[] = [];
    for (const addon of versionData?.addons || []) {
      for (const addonVersion of addon?.addonVersions || []) {
        for (const compatability of addonVersion.compatibilities || []) {
          if (compatability.clusterVersion && !versions.includes(compatability.clusterVersion)) {
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
