import { ResourceOutputs } from '../../../@resources/types.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { TerraformResourceService } from '../../terraform.service.ts';
import { KubernetesCredentials } from '../credentials.ts';
import { KubernetesIngressRuleModule } from '../modules/ingress-rule.ts';
import { KubernetesProvider as TerraformKubernetesProvider } from '../.gen/providers/kubernetes/provider/index.ts';
import { Construct } from 'constructs';

export class KubernetesIngressRuleService extends TerraformResourceService<'ingressRule', KubernetesCredentials> {
  readonly terraform_version = '1.4.5';
  readonly construct = KubernetesIngressRuleModule;

  public configureTerraformProviders(scope: Construct): void {
    new TerraformKubernetesProvider(scope, 'kubernetes', {
      configPath: this.credentials.configPath,
      configContext: this.credentials.configContext,
    });
  }

  get(_id: string): Promise<ResourceOutputs['ingressRule'] | undefined> {
    throw new Error('Method not implemented.');
  }

  list(
    _filterOptions?: Partial<ResourceOutputs['ingressRule']>,
    _pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['ingressRule']>> {
    throw new Error('Method not implemented.');
  }
}
