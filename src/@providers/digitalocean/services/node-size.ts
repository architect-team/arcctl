import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { BaseService } from '../../service.ts';
import { DigitaloceanCredentials } from '../credentials.ts';
import { createApiClient } from 'dots-wrapper';

export class DigitaloceanNodeSizeService extends BaseService<'nodeSize'> {
  private client: ReturnType<typeof createApiClient>;

  constructor(credentials: DigitaloceanCredentials) {
    super();
    this.client = createApiClient({ token: credentials.token });
  }

  async get(id: string): Promise<ResourceOutputs['nodeSize'] | undefined> {
    const {
      data: { options },
    } = await this.client.kubernetes.listAvailableOptionsOfKubernetes();
    const match = options.sizes.find((size) => size.slug === id);
    return match
      ? {
          id: match.slug,
        }
      : undefined;
  }

  // TODO: implement filter
  async list(
    filterOptions?: Partial<ResourceOutputs['nodeSize']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['nodeSize']>> {
    const {
      data: { options },
    } = await this.client.kubernetes.listAvailableOptionsOfKubernetes();
    return {
      total: options.sizes.length,
      rows: options.sizes.map((size) => ({
        type: 'nodeSize',
        id: size.slug,
        name: size.name,
      })),
    };
  }
}
