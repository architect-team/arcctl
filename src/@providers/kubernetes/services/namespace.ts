import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ResourceService } from '../../service.ts';
import { KubernetesCredentials } from '../credentials.ts';
import { KubernetesNamespaceModule } from '../modules/namespace.ts';
import k8s from '@kubernetes/client-node';

export class KubernetesNamespaceService extends ResourceService<
  'kubernetesNamespace',
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

  async get(
    id: string,
  ): Promise<ResourceOutputs['kubernetesNamespace'] | undefined> {
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
    filterOptions?: Partial<ResourceOutputs['kubernetesNamespace']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['kubernetesNamespace']>> {
    const { body } = await this.client.listNamespace();

    const rows: Array<ResourceOutputs['kubernetesNamespace']> = [];
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

  manage = {
    module: KubernetesNamespaceModule,
  };
}
