import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { TerraformResourceService } from '../../terraform.service.ts';
import { KubernetesCredentials } from '../credentials.ts';
import { KubernetesServiceModule } from '../modules/service.ts';
import { KubernetesNamespaceService } from './namespace.ts';
import k8s from '@kubernetes/client-node';

export class KubernetesServiceService extends TerraformResourceService<'service', KubernetesCredentials> {
  private _client?: k8s.CoreV1Api;

  constructor(private readonly credentials: KubernetesCredentials) {
    super();
  }

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

  async get(id: string): Promise<ResourceOutputs['service'] | undefined> {
    const match = id.match(/^([\dA-Za-z-]+)\/([\w-]+)$/);
    if (!match) {
      throw new Error('ID must be of the format, <namespace>/<uuid>');
    }

    try {
      const { body } = await this.client.readNamespacedService(match[1], match[0]);

      if (!body.metadata?.name) {
        throw new Error('Service exists, but is malformatted.');
      }

      const ports = body.spec?.ports;
      if (!ports) {
        throw new Error('Service exists, but has no ports');
      }

      return {
        id: body.metadata.name,
        host: body.metadata.name,
        port: ports[0].port,
        protocol: 'http',
        url: `http://${body.metadata.name}:${ports[0].port}`,
      };
    } catch {
      return undefined;
    }
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['service']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['service']>> {
    const namespaceService = new KubernetesNamespaceService(this.credentials);
    const namespaces = await namespaceService.list();

    const rows: Array<ResourceOutputs['service']> = [];
    for (const namespace of namespaces.rows) {
      const { body } = await this.client.listNamespacedService(namespace.id);

      for (const service of body.items) {
        const ports = service.spec?.ports;
        if (ports && ports?.length > 0 && service.metadata?.name) {
          rows.push({
            id: `${namespace.id}/${service.metadata?.name}`,
            host: service.metadata.name,
            port: ports[0].port,
            protocol: 'http',
            url: `http://${service.metadata.name}:${ports[0].port}`,
          });
        }
      }
    }

    return {
      total: rows.length,
      rows: rows,
    };
  }

  readonly construct = KubernetesServiceModule;
}
