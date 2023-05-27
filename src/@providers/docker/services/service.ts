import { ResourceInputs, ResourceOutputs } from '../../../@resources/types.js';
import { PagingOptions, PagingResponse } from '../../../utils/paging.js';
import { DeepPartial } from '../../../utils/types.js';
import { CrudResourceService } from '../../crud.service.js';

export class DockerServiceService extends CrudResourceService<'service'> {
  get(id: string): Promise<ResourceOutputs['service'] | undefined> {
    throw new Error('Method not implemented.');
  }
  list(
    filterOptions?: Partial<ResourceOutputs['service']> | undefined,
    pagingOptions?: Partial<PagingOptions> | undefined,
  ): Promise<PagingResponse<ResourceOutputs['service']>> {
    throw new Error('Method not implemented.');
  }

  async create(
    inputs: ResourceInputs['service'],
  ): Promise<ResourceOutputs['service']> {
    const protocol = inputs.protocol || 'http';
    const host = inputs.selector || '';
    const url = `${protocol}://${host}:${inputs.target_port}`;

    return {
      host,
      id: inputs.name,
      port: inputs.target_port,
      protocol,
      url,
    };
  }

  async update(
    inputs: ResourceInputs['service'],
  ): Promise<DeepPartial<ResourceOutputs['service']>> {
    const protocol = inputs.protocol || 'http';
    const host = inputs.selector || '';
    const url = `${protocol}://${host}:${inputs.target_port}`;

    return {
      host,
      id: inputs.name,
      port: inputs.target_port,
      protocol,
      url,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async delete(id: string): Promise<void> {}
}
