import { Construct } from 'constructs';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ProviderStore } from '../../store.ts';
import { TerraformResourceService } from '../../terraform.service.ts';
import { KubernetesProvider as TerraformKubernetesProvider } from '../.gen/providers/kubernetes/provider/index.ts';
import { KubernetesCredentials } from '../credentials.ts';
import { KubernetesNamespaceModule } from '../modules/namespace.ts';
import { kubectlExec } from '../utils.ts';

export class KubernetesNamespaceService extends TerraformResourceService<'namespace', KubernetesCredentials> {
  readonly terraform_version = '1.4.5';
  readonly construct = KubernetesNamespaceModule;

  constructor(accountName: string, credentials: KubernetesCredentials, providerStore: ProviderStore) {
    super(accountName, credentials, providerStore);
  }

  public configureTerraformProviders(scope: Construct): void {
    new TerraformKubernetesProvider(scope, 'kubernetes', {
      configPath: this.credentials.configPath,
      configContext: this.credentials.configContext,
    });
  }

  async get(id: string): Promise<ResourceOutputs['namespace'] | undefined> {
    try {
      const { stdout } = await kubectlExec(this.credentials, ['get', 'namespace', id]);
      const body = JSON.parse(stdout);

      if (!body.metadata?.name) {
        throw new Error('Namespace exists, but is malformatted.');
      }

      return {
        id: body.metadata.name,
      };
    } catch {
      return undefined;
    }
  }

  async list(
    _filterOptions?: Partial<ResourceOutputs['namespace']>,
    _pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['namespace']>> {
    const { stdout } = await kubectlExec(this.credentials, ['get', 'namespace']);
    const body = JSON.parse(stdout);

    const rows: Array<ResourceOutputs['namespace']> = [];
    for (const item of body.items) {
      if (item.metadata?.name) {
        rows.push({
          id: item.metadata.name,
        });
      }

      // TODO: figure out what to do if there is no name? Seems impossible.
    }

    return {
      total: body.items.length,
      rows: rows,
    };
  }
}
