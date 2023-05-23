import { ResourceOutputs } from '../../../@resources/types.js';
import { PagingOptions, PagingResponse } from '../../../utils/paging.js';
import { TerraformResourceService } from '../../terraform.service.js';
import { DockerCredentials } from '../credentials.js';
import { DockerServiceModule } from '../modules/service.js';

export class DockerServiceService extends TerraformResourceService<
  'service',
  DockerCredentials
> {
  get(id: string): Promise<ResourceOutputs['service'] | undefined> {
    throw new Error('Method not implemented.');
  }
  list(
    filterOptions?: Partial<ResourceOutputs['service']> | undefined,
    pagingOptions?: Partial<PagingOptions> | undefined,
  ): Promise<PagingResponse<ResourceOutputs['service']>> {
    throw new Error('Method not implemented.');
  }

  readonly construct = DockerServiceModule;
}
