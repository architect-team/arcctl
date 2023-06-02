import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { TerraformResourceService } from '../../terraform.service.ts';
import { KubernetesCredentials } from '../credentials.ts';
import { KubernetesDeploymentModule } from '../modules/deployment.ts';
import { KubernetesNamespaceService } from './namespace.ts';
import { k8s } from 'deps';

export class KubernetesDeploymentService extends TerraformResourceService<'deployment', KubernetesCredentials> {
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

  async get(id: string): Promise<ResourceOutputs['deployment'] | undefined> {
    const match = id.match(/^([\dA-Za-z-]+)\/([\w-]+)$/);
    if (!match) {
      throw new Error('ID must be of the format, <namespace>/<uuid>');
    }

    try {
      const { body } = await this.client.readNamespacedDeployment(match[1], match[0]);

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
    filterOptions?: Partial<ResourceOutputs['deployment']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['deployment']>> {
    const namespaceService = new KubernetesNamespaceService(this.credentials);
    const namespaces = await namespaceService.list();

    const rows: Array<ResourceOutputs['deployment']> = [];
    for (const namespace of namespaces.rows) {
      const { body } = await this.client.listNamespacedDeployment(namespace.id);

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

  readonly construct = KubernetesDeploymentModule;
}
