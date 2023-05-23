import { ResourceOutputs } from '../../../@resources/index.js';
import { PagingOptions, PagingResponse } from '../../../utils/paging.js';
import { TerraformResourceService } from '../../terraform.service.js';
import { KubernetesCredentials } from '../credentials.js';
import { KubernetesNamespaceModule } from '../modules/namespace.js';
import k8s from '@kubernetes/client-node';

export class KubernetesNamespaceService extends TerraformResourceService<
  'namespace',
  KubernetesCredentials
> {
  private client: k8s.CoreV1Api;

  constructor(credentials: KubernetesCredentials) {
    super();
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
    filterOptions?: Partial<ResourceOutputs['namespace']>,
    pagingOptions?: Partial<PagingOptions>,
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

  readonly construct = KubernetesNamespaceModule;
}
