import { Construct } from 'constructs';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { TerraformResourceService } from '../../terraform.service.ts';
import { KubernetesProvider as TerraformKubernetesProvider } from '../.gen/providers/kubernetes/provider/index.ts';
import { KubernetesCredentials } from '../credentials.ts';
import { KubernetesDeploymentModule } from '../modules/deployment.ts';
import { kubectlExec } from '../utils.ts';
import { KubernetesNamespaceService } from './namespace.ts';

export class KubernetesDeploymentService extends TerraformResourceService<'deployment', KubernetesCredentials> {
  readonly terraform_version = '1.4.5';
  readonly construct = KubernetesDeploymentModule;

  async get(id: string): Promise<ResourceOutputs['deployment'] | undefined> {
    const match = id.match(/^([\dA-Za-z-]+)\/([\w-]+)$/);
    if (!match) {
      throw new Error('ID must be of the format, <namespace>/<uuid>');
    }

    try {
      const { stdout } = await kubectlExec(this.credentials, ['get', 'deployment', '-n', match[1], match[0]]);
      const body = JSON.parse(stdout);

      if (!body.metadata?.name) {
        throw new Error('Deployment exists, but is malformatted.');
      }

      return {
        id: body.metadata.name,
      };
    } catch {
      return undefined;
    }
  }

  async list(
    _filterOptions?: Partial<ResourceOutputs['deployment']>,
    _pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['deployment']>> {
    const namespaceService = new KubernetesNamespaceService(this.accountName, this.credentials, this.providerStore);
    const namespaces = await namespaceService.list();

    const rows: Array<ResourceOutputs['deployment']> = [];
    for (const namespace of namespaces.rows) {
      const { stdout } = await kubectlExec(this.credentials, ['get', 'deployment', '-n', namespace.id]);
      const body = JSON.parse(stdout);

      for (const deployment of body.items) {
        rows.push({
          id: `${namespace.id}/${deployment.metadata?.name}`,
        });
      }
    }

    return {
      total: rows.length,
      rows: rows,
    };
  }

  public configureTerraformProviders(scope: Construct): void {
    new TerraformKubernetesProvider(scope, 'kubernetes', {
      configPath: this.credentials.configPath,
      configContext: this.credentials.configContext,
    });
  }
}
