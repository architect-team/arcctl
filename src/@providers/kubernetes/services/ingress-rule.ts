import { ResourceOutputs } from '../../../@resources/types.js';
import { PagingOptions, PagingResponse } from '../../../utils/paging.js';
import { TerraformResourceService } from '../../terraform.service.js';
import { KubernetesCredentials } from '../credentials.js';
import { KubernetesIngressRuleModule } from '../modules/ingress-rule.js';
import k8s from '@kubernetes/client-node';

export class KubernetesIngressRuleService extends TerraformResourceService<
  'ingressRule',
  KubernetesCredentials
> {
  private _client?: k8s.AppsV1Api;

  constructor(private readonly credentials: KubernetesCredentials) {
    super();
  }

  private get client(): k8s.AppsV1Api {
    if (this._client) {
      return this._client;
    }

    const kubeConfig = new k8s.KubeConfig();
    if (this.credentials.configPath) {
      kubeConfig.loadFromFile(this.credentials.configPath);
    } else {
      kubeConfig.loadFromDefault();
    }

    if (this.credentials.configContext) {
      kubeConfig.setCurrentContext(this.credentials.configContext);
    }

    this._client = kubeConfig.makeApiClient(k8s.AppsV1Api);
    return this._client;
  }

  get(id: string): Promise<ResourceOutputs['ingressRule'] | undefined> {
    throw new Error('Method not implemented.');
  }

  list(
    filterOptions?: Partial<ResourceOutputs['ingressRule']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['ingressRule']>> {
    throw new Error('Method not implemented.');
  }

  readonly construct = KubernetesIngressRuleModule;
}
