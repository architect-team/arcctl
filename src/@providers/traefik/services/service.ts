import yaml from 'js-yaml';
import { Subscriber } from 'rxjs';
import * as path from 'std/path/mod.ts';
import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { DeepPartial } from '../../../utils/types.ts';
import { CrudResourceService } from '../../crud.service.ts';
import { ProviderStore } from '../../store.ts';
import { TraefikCredentials } from '../credentials.ts';
import { TraefikFormattedService } from '../types.ts';
import { TraefikTaskService } from '../utils.ts';

const ROUTER_SUFFIX = '-svc';
const FILE_SUFFIX = ROUTER_SUFFIX + '.yml';
const MOUNT_PATH = '/etc/traefik/';

export class TraefikServiceService extends CrudResourceService<'service', TraefikCredentials> {
  private taskService: TraefikTaskService;

  public constructor(name: string, credentials: TraefikCredentials, providerStore: ProviderStore) {
    super(name, credentials, providerStore);
    this.taskService = new TraefikTaskService({
      account: credentials.account,
      providerStore,
      volume: credentials.volume,
      mountPath: MOUNT_PATH,
    });
  }

  async get(id: string): Promise<ResourceOutputs['service'] | undefined> {
    let filename = '';

    const idParts = id.split('/');
    if (idParts.length === 1) {
      filename = path.join(MOUNT_PATH, id + FILE_SUFFIX);
    } else if (idParts.length === 2) {
      const [namespace, name] = idParts;
      filename = path.join(MOUNT_PATH, namespace, name + FILE_SUFFIX);
    } else {
      throw new Error(`Invalid service id: ${id}. Must be of the format: (<namespace>/)<name>`);
    }

    const contents = await this.taskService.getContents(filename);
    if (!contents) {
      return undefined;
    }

    const entry = yaml.load(contents) as TraefikFormattedService;

    if (entry.http) {
      let host = '';
      if (entry.http.routers[id]) {
        const hostMatches = entry.http.routers[id].rule.match(/Host\(`([^\s]+)`\)/);
        if (hostMatches && hostMatches.length > 1) {
          host = hostMatches[1];
        }
      }

      return {
        ...entry.architect,
        id,
        host,
        port: 80,
        protocol: 'http',
        url: `http://${host}`,
        account: this.accountName,
        target_servers: entry.http.services[id]?.loadBalancer?.servers.map((server) => server.url) || [],
      };
    } else if (entry.tcp) {
      let host = '';
      if (entry.tcp.routers[id]) {
        const hostSNIMatches = entry.tcp.routers[id + ROUTER_SUFFIX].rule.match(/HostSNI\(`([^\s]+)`\)/);
        if (hostSNIMatches && hostSNIMatches.length > 1) {
          host = hostSNIMatches[1];
        }
      }

      return {
        ...entry.architect,
        id,
        host,
        port: 80,
        protocol: 'tcp',
        url: `tcp://${host}`,
        account: this.accountName,
        target_servers: entry.tcp.services[id]?.loadBalancer?.servers.map((server) => server.address) || [],
      };
    }
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['service']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['service']>> {
    const configFiles = await this.taskService.listConfigFiles(MOUNT_PATH, FILE_SUFFIX);
    const configs = await Promise.all<ResourceOutputs['service']>(configFiles.map(async (filename) => {
      const id = filename.replace(new RegExp('^' + MOUNT_PATH + '(.*)' + FILE_SUFFIX + '$'), '$1');
      const normalizedId = id.replace(/\//g, '--');
      const contents = await this.taskService.getContents(filename);
      const config = yaml.load(contents) as TraefikFormattedService;

      if (config.http) {
        let host = '';
        if (config.http.routers[normalizedId + ROUTER_SUFFIX]) {
          const hostMatches = config.http.routers[normalizedId + ROUTER_SUFFIX].rule.match(/Host\(`([^\s]+)`\)/);
          if (hostMatches && hostMatches.length > 1) {
            host = hostMatches[1];
          }

          const hostSNIMatches = config.http.routers[normalizedId + ROUTER_SUFFIX].rule.match(/HostSNI\(`([^\s]+)`\)/);
          if (hostSNIMatches && hostSNIMatches.length > 1) {
            host = hostSNIMatches[1];
          }
        }

        return {
          ...config.architect,
          id,
          host,
          port: 80,
          protocol: 'http',
          url: `http://${host}`,
          account: this.accountName,
          target_servers: config.http.services[normalizedId + ROUTER_SUFFIX]?.loadBalancer?.servers.map((server) =>
            server.url
          ) ||
            [],
        };
      } else if (config.tcp) {
        let host = '';
        if (config.tcp.routers[normalizedId + ROUTER_SUFFIX]) {
          const hostSNIMatches = config.tcp.routers[normalizedId + ROUTER_SUFFIX].rule.match(/HostSNI\(`([^\s]+)`\)/);
          if (hostSNIMatches && hostSNIMatches.length > 1) {
            host = hostSNIMatches[1];
          }
        }

        return {
          ...config.architect,
          id,
          host,
          port: 80,
          protocol: 'tcp',
          url: `tcp://${host}`,
          account: this.accountName,
          target_servers: config.tcp.services[normalizedId + ROUTER_SUFFIX]?.loadBalancer?.servers.map((server) =>
            server.address
          ) || [],
        };
      }

      throw new Error(`Invalid service format: ${config}`);
    }));

    return {
      total: configs.length,
      rows: configs,
    };
  }

  async create(subscriber: Subscriber<string>, inputs: ResourceInputs['service']): Promise<ResourceOutputs['service']> {
    let id = inputs.name;
    if (inputs.namespace) {
      id = inputs.namespace + '/' + id;
    }

    const normalizedId = id.replaceAll('/', '--');
    const routerName = normalizedId + ROUTER_SUFFIX;

    let host = normalizedId;
    if (inputs.dnsZone) {
      host += '.' + inputs.dnsZone;
    }

    const isNotHttp = inputs.target_protocol && inputs.target_protocol !== 'http';
    const entry: TraefikFormattedService = {
      architect: inputs,
      [isNotHttp ? 'tcp' : 'http']: {
        routers: {
          [routerName]: {
            rule: isNotHttp ? 'HostSNI(\\\`' + host + '\\\`)' : 'Host(\\\`' + host + '\\\`)',
            service: normalizedId,
            ...(isNotHttp
              ? {
                tls: {},
              }
              : {}),
          },
        },
        services: {
          [normalizedId]: {
            loadBalancer: {
              servers: inputs.target_servers?.map((server) => {
                const url = new URL(server);
                return {
                  [isNotHttp ? 'address' : 'url']: isNotHttp ? url.host : url.toString(),
                };
              }) || [],
            },
          },
        },
      },
    };

    await this.taskService.writeFile(path.join(MOUNT_PATH, normalizedId + FILE_SUFFIX), yaml.dump(entry));

    const protocol = inputs.target_protocol || 'http';
    const port = 80;
    let url = `${protocol}://`;
    if (inputs.username) {
      url += `${inputs.username}:${inputs.password}@`;
    }
    url += host;
    if (isNotHttp || port !== 80) {
      url += `:${port}`;
    }

    return {
      ...inputs,
      id: normalizedId,
      host,
      port,
      protocol,
      username: inputs.username || '',
      password: inputs.password || '',
      url,
      account: this.accountName,
      target_servers: inputs.target_servers,
    };
  }

  async update(
    subscriber: Subscriber<string>,
    id: string,
    inputs: DeepPartial<ResourceInputs['service']>,
  ): Promise<ResourceOutputs['service']> {
    const normalizedPreviousId = id.replaceAll('/', '--');
    const contents = await this.taskService.getContents(path.join(MOUNT_PATH, normalizedPreviousId + FILE_SUFFIX));
    const existingConfig = yaml.load(contents) as TraefikFormattedService;

    let newId = id;
    if (inputs.name && inputs.namespace) {
      newId = inputs.namespace + '/' + inputs.name;
    } else if (inputs.name) {
      newId = inputs.name;
    }
    const normalizedNewId = newId.replaceAll('/', '--');

    const isNotHttp = inputs.target_protocol && inputs.target_protocol !== 'http';

    let previousServers: string[] = [];
    if (existingConfig.http) {
      previousServers = existingConfig.http.services[normalizedPreviousId].loadBalancer.servers.map((server) =>
        server.url
      );
    } else if (existingConfig.tcp) {
      previousServers = existingConfig.tcp.services[normalizedPreviousId].loadBalancer.servers.map((server) =>
        server.address
      );
    }

    let host = normalizedNewId;
    if (inputs.dnsZone) {
      host += '.' + inputs.dnsZone;
    }

    const target_servers = inputs.target_servers as string[] | undefined || existingConfig.architect.target_servers;
    const newEntry: TraefikFormattedService = {
      architect: {
        name: inputs.name || existingConfig.architect.name,
        type: 'service',
        target_port: inputs.target_port || existingConfig.architect.target_port,
        target_protocol: inputs.target_protocol || existingConfig.architect.target_protocol,
        username: inputs.username || existingConfig.architect.username,
        password: inputs.password || existingConfig.architect.password,
        account: this.accountName,
        dnsZone: inputs.dnsZone || existingConfig.architect.dnsZone,
        external_hostname: inputs.external_hostname || existingConfig.architect.external_hostname,
        labels: (inputs.labels || {}) as Record<string, string> || existingConfig.architect.labels,
        namespace: inputs.namespace || existingConfig.architect.namespace,
        target_servers,
        target_deployment: inputs.target_deployment || existingConfig.architect.target_deployment,
      },
      [isNotHttp ? 'tcp' : 'http']: {
        routers: {
          [normalizedNewId + ROUTER_SUFFIX]: {
            rule: isNotHttp ? 'HostSNI(\\\`' + host + '\\\`)' : 'Host(\\\`' + host + '\\\`)',
            service: normalizedNewId,
            ...(isNotHttp
              ? {
                tls: {},
              }
              : {}),
          },
        },
        services: {
          [normalizedNewId]: {
            loadBalancer: {
              servers: target_servers?.map((url) => ({
                [isNotHttp ? 'address' : 'url']: url,
              })) || [],
            },
          },
        },
      },
    };

    if (normalizedNewId !== normalizedPreviousId) {
      subscriber.next('Removing old service: ' + normalizedPreviousId);
      await this.taskService.deleteFile(path.join(MOUNT_PATH, normalizedPreviousId + FILE_SUFFIX));
    }

    subscriber.next('Registering new service: ' + normalizedNewId);
    await this.taskService.writeFile(path.join(MOUNT_PATH, normalizedNewId + FILE_SUFFIX), yaml.dump(newEntry));

    const port = 80;
    const protocol = inputs.target_protocol || 'http';
    let url = `${protocol}://`;
    if (inputs.username) {
      url += `${inputs.username}:${inputs.password}@`;
    }

    url += host;
    if (isNotHttp) {
      url += `:${port}`;
    }

    return {
      ...newEntry.architect,
      id: normalizedNewId,
      host,
      port,
      protocol,
      username: inputs.username || '',
      password: inputs.password || '',
      url,
      account: this.accountName,
      target_servers: previousServers,
    };
  }

  async delete(subscriber: Subscriber<string>, id: string): Promise<void> {
    await this.taskService.deleteFile(path.join(MOUNT_PATH, id + FILE_SUFFIX));
  }
}
