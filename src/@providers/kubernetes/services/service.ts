import k8s from '@kubernetes/client-node';
import { Construct } from 'constructs';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { TerraformResourceService } from '../../terraform.service.ts';
import { KubernetesProvider as TerraformKubernetesProvider } from '../.gen/providers/kubernetes/provider/index.ts';
import { KubernetesCredentials } from '../credentials.ts';
import { KubernetesServiceModule } from '../modules/service.ts';
import { kubectlExec } from '../utils.ts';
import { KubernetesNamespaceService } from './namespace.ts';

export class KubernetesServiceService extends TerraformResourceService<'service', KubernetesCredentials> {
  private _client?: k8s.CoreV1Api;

  readonly terraform_version = '1.4.5';
  readonly construct = KubernetesServiceModule;

  public configureTerraformProviders(scope: Construct): void {
    new TerraformKubernetesProvider(scope, 'kubernetes', {
      configPath: this.credentials.configPath,
      configContext: this.credentials.configContext,
    });
  }

  async get(id: string): Promise<ResourceOutputs['service'] | undefined> {
    const match = id.match(/^([\dA-Za-z-]+)\/([\w-]+)$/);
    if (!match) {
      throw new Error('ID must be of the format, <namespace>/<uuid>');
    }

    try {
      const { stdout } = await kubectlExec(this.credentials, ['get', 'svc', '-n', match[1], match[2]]);
      const body = JSON.parse(stdout);

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
    _filterOptions?: Partial<ResourceOutputs['service']>,
    _pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['service']>> {
    const namespaceService = new KubernetesNamespaceService(this.accountName, this.credentials, this.providerStore);
    const namespaces = await namespaceService.list();

    const rows: Array<ResourceOutputs['service']> = [];
    for (const namespace of namespaces.rows) {
      const { stdout } = await kubectlExec(this.credentials, ['get', 'svc', '-n', namespace.id]);
      const body = JSON.parse(stdout);

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
}
