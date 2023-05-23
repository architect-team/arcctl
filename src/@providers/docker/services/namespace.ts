import { ResourceOutputs } from '../../../@resources/index.js';
import { PagingOptions, PagingResponse } from '../../../utils/paging.js';
import { ResourceService } from '../../service.js';
import { DockerCredentials } from '../credentials.js';
import { DockerNetworkModule } from '../modules/namespace.js';

export class DockerNamespaceService extends ResourceService<
  'namespace',
  DockerCredentials
> {
  get?(id: string): Promise<ResourceOutputs['namespace'] | undefined> {
    throw new Error('Method not implemented.');
  }

  list?(
    filterOptions?: Partial<ResourceOutputs['namespace']> | undefined,
    pagingOptions?: Partial<PagingOptions> | undefined,
  ): Promise<PagingResponse<ResourceOutputs['namespace']>> {
    throw new Error('Method not implemented.');
  }

  manage = {
    module: DockerNetworkModule,
  };
}
