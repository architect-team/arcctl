import yaml from 'js-yaml';
import { Subscriber } from 'rxjs';
import * as path from 'std/path/mod.ts';
import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { DeepPartial } from '../../../utils/types.ts';
import { CrudResourceService } from '../../crud.service.ts';
import { ProviderStore } from '../../store.ts';
import { TraefikCredentials } from '../credentials.ts';
import { TraefikFormattedIngressRule } from '../types.ts';
import { TraefikTaskService } from '../utils.ts';

const ROUTER_SUFFIX = '-ing';
const FILE_SUFFIX = ROUTER_SUFFIX + '.yml';
const MOUNT_PATH = '/etc/traefik/';

export class TraefikIngressRuleService extends CrudResourceService<'ingressRule', TraefikCredentials> {
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

  async get(id: string): Promise<ResourceOutputs['ingressRule'] | undefined> {
    const contents = await this.taskService.getContents(path.join(MOUNT_PATH, id + FILE_SUFFIX));
    if (!contents) {
      return undefined;
    }

    const config = yaml.load(contents) as TraefikFormattedIngressRule;

    if (config.http) {
      let host = '';
      const hostMatches = config.http.routers[id + ROUTER_SUFFIX].rule.match(/Host\(`([^\s]+)`\)/);
      if (hostMatches && hostMatches.length > 1) {
        host = hostMatches[1];
      }

      let ingressPath = '/';
      const pathMatches = config.http.routers[id + ROUTER_SUFFIX].rule.match(/PathPrefix\(`([^\s]+)`\)/);
      if (pathMatches && pathMatches.length > 1) {
        ingressPath = pathMatches[1];
      }

      return {
        id,
        host,
        port: 80,
        url: `http://${host}:80${ingressPath}`,
        path: ingressPath,
        loadBalancerHostname: '127.0.0.1',
      };
    } else if (config.tcp) {
      let host = '';
      const hostSNIMatches = config.tcp.routers[id + ROUTER_SUFFIX].rule.match(/HostSNI\(`([^\s]+)`\)/);
      if (hostSNIMatches && hostSNIMatches.length > 1) {
        host = hostSNIMatches[1];
      }

      let ingressPath = '/';
      const pathMatches = config.tcp.routers[id + ROUTER_SUFFIX].rule.match(/PathPrefix\(`([^\s]+)`\)/);
      if (pathMatches && pathMatches.length > 1) {
        ingressPath = pathMatches[1];
      }

      return {
        id,
        host,
        port: 80,
        url: `tcp://${host}:80${ingressPath}`,
        path: ingressPath,
        loadBalancerHostname: '127.0.0.1',
      };
    }
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['ingressRule']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['ingressRule']>> {
    const configFiles = await this.taskService.listConfigFiles(MOUNT_PATH, FILE_SUFFIX);
    const configs = await Promise.all<ResourceOutputs['ingressRule']>(configFiles.map(async (filename) => {
      const id = filename.replace(new RegExp('^' + MOUNT_PATH + '(.*)' + FILE_SUFFIX + '$'), '$1');
      const contents = await this.taskService.getContents(filename);
      const config = yaml.load(contents) as TraefikFormattedIngressRule;

      let host = '';
      let ingressPath = '/';
      if (config.http) {
        const hostMatches = config.http.routers[id + ROUTER_SUFFIX].rule.match(/Host\(`([^\s]+)`\)/);
        if (hostMatches && hostMatches.length > 1) {
          host = hostMatches[1];
        }

        const pathMatches = config.http.routers[id + ROUTER_SUFFIX].rule.match(/PathPrefix\(`([^\s]+)`\)/);
        if (pathMatches && pathMatches.length > 1) {
          ingressPath = pathMatches[1];
        }
      } else if (config.tcp) {
        const hostSNIMatches = config.tcp.routers[id + ROUTER_SUFFIX].rule.match(/HostSNI\(`([^\s]+)`\)/);
        if (hostSNIMatches && hostSNIMatches.length > 1) {
          host = hostSNIMatches[1];
        }

        const pathMatches = config.tcp.routers[id + ROUTER_SUFFIX].rule.match(/PathPrefix\(`([^\s]+)`\)/);
        if (pathMatches && pathMatches.length > 1) {
          ingressPath = pathMatches[1];
        }
      }

      return {
        id,
        host,
        port: 80,
        url: `${config.http ? 'http' : 'tcp'}://${host}:80${ingressPath}`,
        path: ingressPath,
        loadBalancerHostname: '127.0.0.1',
      };
    }));

    return {
      total: configs.length,
      rows: configs,
    };
  }

  async create(
    subscriber: Subscriber<string>,
    inputs: ResourceInputs['ingressRule'],
  ): Promise<ResourceOutputs['ingressRule']> {
    const normalizedId = inputs.name.replaceAll('/', '--');

    const hostParts = [];
    if (inputs.subdomain) {
      hostParts.push(inputs.subdomain);
    }

    if (inputs.dnsZone) {
      hostParts.push(inputs.dnsZone);
    }

    const host = hostParts.join('.');

    const rules = [];
    const isNotHttp = inputs.protocol && inputs.protocol !== 'http';
    if (isNotHttp) {
      rules.push('HostSNI(\\\`' + host + '\\\`)');
    } else {
      rules.push('Host(\\\`' + host + '\\\`)');
    }

    if (inputs.path) {
      rules.push('PathPrefix(\\\`' + inputs.path + '\\\`)');
    }

    await this.taskService.writeFile(
      path.join(MOUNT_PATH, normalizedId + FILE_SUFFIX),
      yaml.dump({
        [isNotHttp ? 'tcp' : 'http']: {
          routers: {
            [normalizedId + ROUTER_SUFFIX]: {
              rule: rules.join(' && '),
              service: inputs.service,
              ...(isNotHttp ? {} : {
                middlewares: [normalizedId + ROUTER_SUFFIX],
              }),
              ...(isNotHttp
                ? {
                  tls: {
                    passthrough: true,
                  },
                }
                : {}),
            },
          },

          ...(isNotHttp ? {} : {
            middlewares: {
              [normalizedId + ROUTER_SUFFIX]: {
                headers: {
                  accessControlAllowOriginList: '*',
                },
              },
            },
          }),
        },
      } as TraefikFormattedIngressRule),
    );

    let urlPath = inputs.path || '/';
    if (!urlPath.endsWith('/')) {
      urlPath += '/';
    }

    let url = `${inputs.protocol || 'http'}://`;
    if (inputs.username) {
      url += `${inputs.username}:${inputs.password}@`;
    }

    url += `${host}${urlPath}`;

    return {
      id: normalizedId,
      host,
      port: 80,
      path: urlPath,
      username: inputs.username,
      password: inputs.password,
      url,
      loadBalancerHostname: '127.0.0.1',
    };
  }

  async update(
    subscriber: Subscriber<string>,
    id: string,
    inputs: DeepPartial<ResourceInputs['ingressRule']>,
  ): Promise<ResourceOutputs['ingressRule']> {
    const contents = await this.taskService.getContents(path.join(MOUNT_PATH, id + FILE_SUFFIX));

    const existingConfig = yaml.load(contents) as TraefikFormattedIngressRule;

    let previousName = '';
    let previousService = '';
    if (existingConfig.http) {
      previousName = Object.keys(existingConfig.http.routers)[0];
      previousService = existingConfig.http.routers[previousName].service;
    } else if (existingConfig.tcp) {
      previousName = Object.keys(existingConfig.tcp.routers)[0];
      previousService = existingConfig.tcp.routers[previousName].service;
    }

    const normalizedId = inputs.name?.replaceAll('/', '--') || previousName;

    const hostParts = [];
    if (inputs.subdomain) {
      hostParts.push(inputs.subdomain);
    }

    if (inputs.dnsZone) {
      hostParts.push(inputs.dnsZone);
    }

    const host = hostParts.join('.');

    const rules = [];
    const isNotHttp = inputs.protocol && inputs.protocol !== 'http';
    if (isNotHttp) {
      rules.push('HostSNI(\\\`' + host + '\\\`)');
    } else {
      rules.push('Host(\\\`' + host + '\\\`)');
    }

    if (inputs.path) {
      rules.push('PathPrefix(\\\`' + inputs.path + '\\\`)');
    }

    const newEntry: TraefikFormattedIngressRule = {
      [isNotHttp ? 'tcp' : 'http']: {
        routers: {
          [normalizedId]: {
            rule: rules.join(' && '),
            service: inputs.service || previousService,
            ...(isNotHttp
              ? {
                tls: {
                  passthrough: true,
                },
              }
              : {}),
          },
        },
      },
    };

    if (inputs.name && inputs.name.replaceAll('/', '--') !== previousName) {
      subscriber.next('Removing old ingressRule');
      await this.taskService.deleteFile(path.join(MOUNT_PATH, previousName + FILE_SUFFIX));
      subscriber.next('Registering new ingressRule');
    }

    await this.taskService.writeFile(path.join(MOUNT_PATH, normalizedId + FILE_SUFFIX), yaml.dump(newEntry));

    let urlPath = inputs.path || '/';
    if (!urlPath.endsWith('/')) {
      urlPath += '/';
    }

    let url = `${inputs.protocol || 'http'}://`;
    if (inputs.username) {
      url += `${inputs.username}:${inputs.password}@`;
    }

    url += `${host}${urlPath}`;

    return {
      id: normalizedId,
      host,
      port: 80,
      path: urlPath,
      username: inputs.username,
      password: inputs.password,
      url,
      loadBalancerHostname: '127.0.0.1',
    };
  }

  async delete(_subscriber: Subscriber<string>, id: string): Promise<void> {
    await this.taskService.deleteFile(path.join(MOUNT_PATH, id.replaceAll('/', '--') + FILE_SUFFIX));
  }
}
