import { ResourceOutputs } from '../../../@resources/index.js';
import { PagingOptions, PagingResponse } from '../../../utils/paging.js';
import { BaseService } from '../../service.js';
import { DigitaloceanCredentials } from '../credentials.js';
import { createApiClient } from 'dots-wrapper';

export class DigitaloceanKubernetesVersionService extends BaseService<'kubernetesVersion'> {
  private client: ReturnType<typeof createApiClient>;

  constructor(credentials: DigitaloceanCredentials) {
    super();
    this.client = createApiClient({ token: credentials.token });
  }

  async get(
    id: string,
  ): Promise<ResourceOutputs['kubernetesVersion'] | undefined> {
    const {
      data: { options },
    } = await this.client.kubernetes.listAvailableOptionsOfKubernetes();
    const match = options.versions.find((version) => version.slug === id);

    return match
      ? {
          id: match.slug,
          name: match.kubernetes_version,
        }
      : undefined;
  }

  // TODO: implement filter
  async list(
    filterOptions?: Partial<ResourceOutputs['kubernetesVersion']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['kubernetesVersion']>> {
    const {
      data: { options },
    } = await this.client.kubernetes.listAvailableOptionsOfKubernetes();

    return {
      total: options.versions.length,
      rows: options.versions.map((version) => ({
        type: 'kubernetesVersion',
        id: version.slug,
        name: version.kubernetes_version,
      })),
    };
  }
}
