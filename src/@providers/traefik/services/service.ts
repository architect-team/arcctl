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
    const contents = await this.taskService.getContents(path.join(MOUNT_PATH, id + FILE_SUFFIX));
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

        const hostSNIMatches = entry.http.routers[id + ROUTER_SUFFIX].rule.match(/HostSNI\(`([^\s]+)`\)/);
        if (hostSNIMatches && hostSNIMatches.length > 1) {
          host = hostSNIMatches[1];
        }
      }

      return {
        id,
        host,
        port: 80,
        protocol: 'http',
        url: `http://${host}`,
        account: this.accountName,
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
        id,
        host,
        port: 80,
        protocol: 'tcp',
        url: `tcp://${host}`,
        account: this.accountName,
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
      const contents = await this.taskService.getContents(filename);
      const config = yaml.load(contents) as TraefikFormattedService;

      if (config.http) {
        let host = '';
        if (config.http.routers[id + ROUTER_SUFFIX]) {
          const hostMatches = config.http.routers[id + ROUTER_SUFFIX].rule.match(/Host\(`([^\s]+)`\)/);
          if (hostMatches && hostMatches.length > 1) {
            host = hostMatches[1];
          }

          const hostSNIMatches = config.http.routers[id + ROUTER_SUFFIX].rule.match(/HostSNI\(`([^\s]+)`\)/);
          if (hostSNIMatches && hostSNIMatches.length > 1) {
            host = hostSNIMatches[1];
          }
        }

        return {
          id,
          host,
          port: 80,
          protocol: 'http',
          url: `http://${host}`,
          account: this.accountName,
        };
      } else if (config.tcp) {
        let host = '';
        if (config.tcp.routers[id + ROUTER_SUFFIX]) {
          const hostSNIMatches = config.tcp.routers[id + ROUTER_SUFFIX].rule.match(/HostSNI\(`([^\s]+)`\)/);
          if (hostSNIMatches && hostSNIMatches.length > 1) {
            host = hostSNIMatches[1];
          }
        }

        return {
          id,
          host,
          port: 80,
          protocol: 'tcp',
          url: `tcp://${host}`,
          account: this.accountName,
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
    const serviceName = inputs.name.replaceAll('/', '--');
    const routerName = serviceName + ROUTER_SUFFIX;

    let host = serviceName;
    if (inputs.dnsZone) {
      host += '.' + inputs.dnsZone;
    }

    const isNotHttp = inputs.target_protocol && inputs.target_protocol !== 'http';
    const entry: TraefikFormattedService = {
      [isNotHttp ? 'tcp' : 'http']: {
        routers: {
          [routerName]: {
            rule: isNotHttp ? 'HostSNI(\\\`' + host + '\\\`)' : 'Host(\\\`' + host + '\\\`)',
            service: serviceName,
            ...(isNotHttp
              ? {
                tls: {
                  passthrough: true,
                },
              }
              : {}),
          },
        },
        services: {
          [serviceName]: {
            loadBalancer: {
              servers: (isNotHttp
                ? [{
                  address: `${inputs.target_deployment.replaceAll('/', '--')}:${inputs.target_port}`,
                }]
                : [{
                  url: `http://${inputs.target_deployment.replaceAll('/', '--')}:${inputs.target_port}`,
                }]),
            },
          },
        },
      },
    };

    await this.taskService.writeFile(path.join(MOUNT_PATH, serviceName + FILE_SUFFIX), yaml.dump(entry));
    const protocol = inputs.target_protocol || 'http';
    const port = inputs.port || 80;
    let url = `${protocol}://`;
    if (inputs.username) {
      url += `${inputs.username}:${inputs.password}@`;
    }
    url += host;
    if (isNotHttp || port !== 80) {
      url += `:${port}`;
    }

    return {
      id: serviceName,
      host,
      port,
      protocol,
      username: inputs.username || '',
      password: inputs.password || '',
      url,
      account: this.accountName,
    };
  }

  async update(
    subscriber: Subscriber<string>,
    id: string,
    inputs: DeepPartial<ResourceInputs['service']>,
  ): Promise<ResourceOutputs['service']> {
    const contents = await this.taskService.getContents(path.join(MOUNT_PATH, id + FILE_SUFFIX));
    const existingConfig = yaml.load(contents) as TraefikFormattedService;
    const isNotHttp = inputs.target_protocol && inputs.target_protocol !== 'http';

    let previousServiceName = '';
    let previousServers: { url?: string; address?: string }[] = [];
    if (existingConfig.http) {
      previousServiceName = Object.keys(existingConfig.http.services)[0];
      previousServers = existingConfig.http.services[previousServiceName].loadBalancer.servers;
    } else if (existingConfig.tcp) {
      previousServiceName = Object.keys(existingConfig.tcp.services)[0];
      previousServers = existingConfig.tcp.services[previousServiceName].loadBalancer.servers;
    }

    const newServiceName = inputs.name?.replaceAll('/', '--') || previousServiceName;
    const newRouterName = newServiceName + ROUTER_SUFFIX;
    let host = newServiceName;
    if (inputs.dnsZone) {
      host += '.' + inputs.dnsZone;
    }

    const newEntry: TraefikFormattedService = {
      [isNotHttp ? 'tcp' : 'http']: {
        routers: {
          [newRouterName]: {
            rule: isNotHttp ? 'HostSNI(\\\`' + host + '\\\`)' : 'Host(\\\`' + host + '\\\`)',
            service: newServiceName,
            ...(isNotHttp
              ? {
                tls: {
                  passthrough: true,
                },
              }
              : {}),
          },
        },
        services: {
          [newServiceName]: {
            loadBalancer: {
              servers: inputs.target_port && inputs.target_deployment
                ? (isNotHttp
                  ? [{
                    address: `${inputs.target_deployment.replaceAll('/', '--')}:${inputs.target_port}`,
                  }]
                  : [{
                    url: `http://${inputs.target_deployment.replaceAll('/', '--')}:${inputs.target_port}`,
                  }])
                : previousServers,
            },
          },
        },
      },
    };

    if (inputs.name && inputs.name.replaceAll('/', '--') !== previousServiceName) {
      subscriber.next('Removing old service');
      await this.taskService.deleteFile(path.join(MOUNT_PATH, previousServiceName + FILE_SUFFIX));
      subscriber.next('Registering new service');
    }

    await this.taskService.writeFile(path.join(MOUNT_PATH, newServiceName + FILE_SUFFIX), yaml.dump(newEntry));

    const port = 80;
    const protocol = inputs.target_protocol || 'http';
    let url = `${protocol}://`;
    if (inputs.username) {
      url += `${inputs.username}:${inputs.password}@`;
    }

    url += host;
    if (isNotHttp || port !== 80) {
      url += `:${port}`;
    }

    return {
      id: newServiceName,
      host,
      port,
      protocol,
      username: inputs.username || '',
      password: inputs.password || '',
      url,
      account: this.accountName,
    };
  }

  async delete(subscriber: Subscriber<string>, id: string): Promise<void> {
    await this.taskService.deleteFile(path.join(MOUNT_PATH, id.replaceAll('/', '--') + FILE_SUFFIX));
  }
}
