import k8s from '@kubernetes/client-node';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ResourceService } from '../../base.service.ts';
import { KubernetesCredentials } from '../credentials.ts';
import { KubernetesNamespaceService } from './namespace.ts';

export class KubernetesPodService extends ResourceService<'pod', KubernetesCredentials> {
  private _client?: k8s.CoreV1Api;

  private get client(): k8s.CoreV1Api {
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

    this._client = kubeConfig.makeApiClient(k8s.CoreV1Api);
    return this._client;
  }

  async get(id: string): Promise<ResourceOutputs['pod'] | undefined> {
    const match = id.match(/^([\dA-Za-z-]+)\/([\w-]+)$/);
    if (!match) {
      throw new Error('ID must be of the format, <namespace>/<uuid>');
    }

    try {
      const { body } = await this.client.readNamespacedPod(match[1], match[0]);

      if (!body.metadata?.name) {
        throw new Error('Pod exists, but is malformatted.');
      }

      return {
        id: body.metadata.name,
      };
    } catch {
      return undefined;
    }
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['pod']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['pod']>> {
    const namespaceService = new KubernetesNamespaceService(this.accountName, this.credentials, this.providerStore);
    const namespaces = await namespaceService.list();

    const rows: Array<ResourceOutputs['deployment']> = [];
    for (const namespace of namespaces.rows) {
      const { body } = await this.client.listNamespacedPod(namespace.id);

      for (const pod of body.items) {
        rows.push({
          id: `${namespace.id}/${pod.metadata?.name}`,
        });
      }
    }

    return {
      total: rows.length,
      rows: rows,
    };
  }
}
