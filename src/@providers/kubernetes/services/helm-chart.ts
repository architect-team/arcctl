import { ResourceOutputs } from '../../../@resources/types.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ResourceService } from '../../service.ts';
import { KubernetesCredentials } from '../credentials.ts';
import { KubernetesHelmChartModule } from '../modules/helm-chart.ts';

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
