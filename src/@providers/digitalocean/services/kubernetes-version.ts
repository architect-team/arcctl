import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ResourceService } from '../../base.service.ts';
import { DigitaloceanCredentials } from '../credentials.ts';
import { createApiClient } from 'dots-wrapper';

export class DigitaloceanKubernetesVersionService extends ResourceService<
  'kubernetesVersion',
  DigitaloceanCredentials
> {
  private client: ReturnType<typeof createApiClient>;

  constructor(credentials: DigitaloceanCredentials) {
    super(credentials);
    this.client = createApiClient({ token: credentials.token });
  }

  async get(id: string): Promise<ResourceOutputs['kubernetesVersion'] | undefined> {
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
    _filterOptions?: Partial<ResourceOutputs['kubernetesVersion']>,
    _pagingOptions?: Partial<PagingOptions>,
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
