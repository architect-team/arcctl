import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ResourceService } from '../../service.ts';
import { DockerCredentials } from '../credentials.ts';
import { DockerDeploymentModule } from '../modules/deployment.ts';

export class DockerDeploymentService extends ResourceService<
  'deployment',
  DockerCredentials
> {
  get?(id: string): Promise<ResourceOutputs['deployment'] | undefined> {
    throw new Error('Method not implemented.');
  }

  list?(
    filterOptions?: Partial<ResourceOutputs['deployment']> | undefined,
    pagingOptions?: Partial<PagingOptions> | undefined,
  ): Promise<PagingResponse<ResourceOutputs['deployment']>> {
    throw new Error('Method not implemented.');
  }

  manage = {
    module: DockerDeploymentModule,
  };
}
