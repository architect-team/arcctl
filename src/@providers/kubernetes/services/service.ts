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
  readonly terraform_version = '1.4.5';
  readonly construct = KubernetesServiceModule;

  public configureTerraformProviders(scope: Construct): void {
    new TerraformKubernetesProvider(scope, 'kubernetes', {
      configPath: this.credentials.configPath,
      configContext: this.credentials.configContext,
    });
  }

  private async getTargetServers(id: string): Promise<string[]> {
    const match = id.match(/^([\dA-Za-z-]+)\/([\w-]+)$/);
    if (!match) {
      throw new Error('ID must be of the format, <namespace>/<uuid>');
    }

    const [_, namespace, svcName] = match;
    const { stdout: endpointsStdout } = await kubectlExec(this.credentials, [
      'get',
      'endpointSlice',
      '-n',
      namespace,
      '-l',
      'kubernetes.io/service-name=' + svcName,
    ]);
    const endpointsBody = JSON.parse(endpointsStdout);

    const target_servers: string[] = [];
    for (const item of endpointsBody.items) {
      if (!item.ports || item.ports.length === 0) {
        continue;
      }

      const port = item.ports[0].port;

      for (const endpoint of item.endpoints) {
        for (const addr of endpoint.addresses) {
          target_servers.push(`${addr}:${port}`);
        }
      }
    }

    return target_servers;
  }

  async get(id: string): Promise<ResourceOutputs['service'] | undefined> {
    const match = id.match(/^([\dA-Za-z-]+)\/([\w-]+)$/);
    if (!match) {
      throw new Error('ID must be of the format, <namespace>/<uuid>');
    }

    try {
      const [_, namespace, svcName] = match;
      const { stdout } = await kubectlExec(this.credentials, ['get', 'svc', '-n', namespace, svcName]);
      const body = JSON.parse(stdout);

      if (!body.metadata?.name) {
        throw new Error('Service exists, but is malformatted.');
      }

      const ports = body.spec?.ports;
      if (!ports) {
        throw new Error('Service exists, but has no ports');
      }

      let dnsZone: string | undefined;
      const dnsZoneMatches = body.metadata.name.match(/^[^\.]+\.(.*)/);
      if (dnsZoneMatches) {
        dnsZone = dnsZoneMatches[1];
      }

      let externalName: string | undefined;
      let targetDeployment: string | undefined;
      if (body.spec?.type === 'ExternalName') {
        externalName = body.spec?.externalName;
      } else {
        targetDeployment = body.spec?.selector?.['architect.io/name'];
      }

      return {
        id: body.metadata.name,
        host: body.metadata.name,
        port: ports[0].port,
        protocol: 'http',
        url: `http://${body.metadata.name}:${ports[0].port}`,
        account: this.accountName,
        target_servers: await this.getTargetServers(id),
        name: body.metadata.name,
        namespace: body.metadata.namespace,
        target_port: ports[0].targetPort,
        dnsZone,
        external_hostname: externalName,
        target_deployment: targetDeployment,
        labels: body.metadata.labels,
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
          const id = `${namespace.id}/${service.metadata?.name}`;

          let dnsZone: string | undefined;
          const dnsZoneMatches = body.metadata.name.match(/^[^\.]+\.(.*)/);
          if (dnsZoneMatches) {
            dnsZone = dnsZoneMatches[1];
          }

          let externalName: string | undefined;
          let targetDeployment: string | undefined;
          if (body.spec?.type === 'ExternalName') {
            externalName = body.spec?.externalName;
          } else {
            targetDeployment = body.spec?.selector?.['architect.io/name'];
          }

          rows.push({
            id,
            host: service.metadata.name,
            port: ports[0].port,
            protocol: 'http',
            url: `http://${service.metadata.name}:${ports[0].port}`,
            account: this.accountName,
            target_servers: await this.getTargetServers(id),
            name: body.metadata.name,
            namespace: body.metadata.namespace,
            target_port: ports[0].targetPort,
            dnsZone,
            external_hostname: externalName,
            target_deployment: targetDeployment,
            labels: body.metadata.labels,
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
