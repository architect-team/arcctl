import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ResourceService } from '../../base.service.ts';
import { TraefikCredentials } from '../credentials.ts';

export class TraefikNamespaceService extends ResourceService<'namespace', TraefikCredentials> {
  get(_id: string): Promise<ResourceOutputs['namespace'] | undefined> {
    return Promise.resolve(undefined);
  }

  list(
    filterOptions?: Partial<ResourceOutputs['namespace']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['namespace']>> {
    return Promise.resolve({
      total: 0,
      rows: [],
    });
  }
}
