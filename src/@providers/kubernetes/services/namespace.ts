import k8s from '@kubernetes/client-node';
import { Construct } from 'constructs';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ProviderStore } from '../../store.ts';
import { TerraformResourceService } from '../../terraform.service.ts';
import { KubernetesProvider as TerraformKubernetesProvider } from '../.gen/providers/kubernetes/provider/index.ts';
import { KubernetesCredentials } from '../credentials.ts';
import { KubernetesNamespaceModule } from '../modules/namespace.ts';

export class KubernetesNamespaceService extends TerraformResourceService<'namespace', KubernetesCredentials> {
  private client: k8s.CoreV1Api;

  readonly terraform_version = '1.4.5';
  readonly construct = KubernetesNamespaceModule;

  constructor(accountName: string, credentials: KubernetesCredentials, providerStore: ProviderStore) {
    super(accountName, credentials, providerStore);
    const kubeConfig = new k8s.KubeConfig();

    if (credentials.configPath) {
      kubeConfig.loadFromFile(credentials.configPath);
    } else {
      kubeConfig.loadFromDefault();
    }

    if (credentials.configContext) {
      kubeConfig.setCurrentContext(credentials.configContext);
    }

    this.client = kubeConfig.makeApiClient(k8s.CoreV1Api);
  }

  public configureTerraformProviders(scope: Construct): void {
    new TerraformKubernetesProvider(scope, 'kubernetes', {
      configPath: this.credentials.configPath,
      configContext: this.credentials.configContext,
    });
  }

  async get(id: string): Promise<ResourceOutputs['namespace'] | undefined> {
    try {
      const { body } = await this.client.readNamespace(id);

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
    const { body } = await this.client.listNamespace();

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
