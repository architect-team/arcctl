import { ResourceOutputs } from '../../../@resources/types.js';
import { PagingOptions, PagingResponse } from '../../../utils/paging.js';
import { ResourceService } from '../../service.js';
import { KubernetesCredentials } from '../credentials.js';
import { KubernetesHelmChartModule } from '../modules/helm-chart.js';

export class KubernetesHelmChartService extends ResourceService<
  'helmChart',
  KubernetesCredentials
> {
  get(id: string): Promise<ResourceOutputs['helmChart'] | undefined> {
    throw new Error('Method not implemented.');
  }

  list(
    filterOptions?: Partial<ResourceOutputs['helmChart']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['helmChart']>> {
    throw new Error('Method not implemented.');
  }

  manage = {
    module: KubernetesHelmChartModule,
  };
}
