import { ResourceOutputs } from '../../../@resources/types.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ResourceService } from '../../service.ts';
import { DockerCredentials } from '../credentials.ts';
import { DockerServiceModule } from '../modules/service.ts';

export class DockerServiceService extends ResourceService<
  'service',
  DockerCredentials
> {
  get?(id: string): Promise<ResourceOutputs['service'] | undefined> {
    throw new Error('Method not implemented.');
  }
  list?(
    filterOptions?: Partial<ResourceOutputs['service']> | undefined,
    pagingOptions?: Partial<PagingOptions> | undefined,
  ): Promise<PagingResponse<ResourceOutputs['service']>> {
    throw new Error('Method not implemented.');
  }

  manage = {
    module: DockerServiceModule,
  };
}
