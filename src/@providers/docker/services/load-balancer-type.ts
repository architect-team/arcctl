import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ResourceService } from '../../base.service.ts';
import { DockerCredentials } from '../credentials.ts';

const TYPES = [{
  id: 'traefik',
  name: 'Traefik',
}];

export class DockerLoadBalancerTypeService extends ResourceService<'loadBalancerType', DockerCredentials> {
  get(id: string): Promise<ResourceOutputs['loadBalancerType'] | undefined> {
    return Promise.resolve(TYPES.find((row) => row.id === id));
  }

  list(
    filterOptions?: Partial<ResourceOutputs['loadBalancerType']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['loadBalancerType']>> {
    let rows = [...TYPES];

    if (filterOptions?.id) {
      rows = rows.filter((row) => row.id.includes(filterOptions.id!));
    }

    if (filterOptions?.name) {
      rows = rows.filter((row) => row.name.toLowerCase().includes(filterOptions.name!.toLowerCase()));
    }

    return Promise.resolve({
      total: rows.length,
      rows,
    });
  }
}
