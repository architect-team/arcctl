import { ResourceOutputs } from '../../../@resources/types.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { TerraformResourceService } from '../../terraform.service.ts';
import { KubernetesCredentials } from '../credentials.ts';
import { KubernetesHelmChartModule } from '../modules/helm-chart.ts';
import { HelmProvider as TerraformHelmProvider } from '../.gen/providers/helm/provider/index.ts';
import { Construct } from 'constructs';

export class KubernetesHelmChartService extends TerraformResourceService<'helmChart', KubernetesCredentials> {
  readonly terraform_version = '1.4.5';
  readonly construct = KubernetesHelmChartModule;

  public configureTerraformProviders(scope: Construct): void {
    new TerraformHelmProvider(scope, 'helm', {
      kubernetes: {
        configPath: this.credentials.configPath,
        configContext: this.credentials.configContext,
      },
    });
  }

  get(_id: string): Promise<ResourceOutputs['helmChart'] | undefined> {
    throw new Error('Method not implemented.');
  }

  list(
    _filterOptions?: Partial<ResourceOutputs['helmChart']>,
    _pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['helmChart']>> {
    throw new Error('Method not implemented.');
  }
}
