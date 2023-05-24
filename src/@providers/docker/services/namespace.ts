import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ResourceService } from '../../service.ts';
import { DockerCredentials } from '../credentials.ts';
import { DockerNetworkModule } from '../modules/namespace.ts';

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
