import { ResourceOutputs } from '../../../@resources/index.js';
import { PagingOptions, PagingResponse } from '../../../utils/paging.js';
import { TerraformResourceService } from '../../terraform.service.js';
import { DockerCredentials } from '../credentials.js';
import { DockerDeploymentModule } from '../modules/deployment.js';

export class DockerDeploymentService extends TerraformResourceService<
  'deployment',
  DockerCredentials
> {
  get(id: string): Promise<ResourceOutputs['deployment'] | undefined> {
    throw new Error('Method not implemented.');
  }

  list(
    filterOptions?: Partial<ResourceOutputs['deployment']> | undefined,
    pagingOptions?: Partial<PagingOptions> | undefined,
  ): Promise<PagingResponse<ResourceOutputs['deployment']>> {
    throw new Error('Method not implemented.');
  }

  readonly construct = DockerDeploymentModule;
}
