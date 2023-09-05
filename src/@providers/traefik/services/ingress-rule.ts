import yaml from 'js-yaml';
import { Subscriber } from 'rxjs';
import * as path from 'std/path/mod.ts';
import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { DeepPartial } from '../../../utils/types.ts';
import { CrudResourceService } from '../../crud.service.ts';
import { ProviderStore } from '../../store.ts';
import { TraefikCredentials } from '../credentials.ts';
import { TraefikFormattedIngressRule, TraefikMiddleware } from '../types.ts';
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

  private headersToMiddleware(headers: Record<string, string>): TraefikMiddleware {
    const _headers = { ...headers };

    const res: TraefikMiddleware = {
      headers: {},
    };

    if (_headers['Access-Control-Allow-Origin']) {
      res.headers = res.headers || {};
      if (_headers['Access-Control-Allow-Origin'] !== '*') {
        const value = JSON.parse(_headers['Access-Control-Allow-Origin']);
        if (Array.isArray(value)) {
          res.headers['accessControlAllowOriginList'] = value.map((item) => item.replace(/\/$/, ''));
        } else {
          res.headers['accessControlAllowOriginList'] = [value.replace(/\/$/, '')];
        }
      } else {
        res.headers['accessControlAllowOriginList'] = ['*'];
      }

      res.headers.addVaryHeader = true;
      delete _headers['Access-Control-Allow-Origin'];
    }

    if (_headers['Access-Control-Allow-Methods']) {
      res.headers = res.headers || {};
      if (_headers['Access-Control-Allow-Methods'] !== '*') {
        const value = JSON.parse(_headers['Access-Control-Allow-Methods']);
        if (Array.isArray(value)) {
          res.headers['accessControlAllowMethods'] = value;
        } else {
          res.headers['accessControlAllowMethods'] = [value];
        }
      } else {
        res.headers['accessControlAllowMethods'] = ['*'];
      }

      delete _headers['Access-Control-Allow-Methods'];
    }

    if (_headers['Access-Control-Allow-Headers']) {
      res.headers = res.headers || {};
      res.headers.accessControlAllowHeaders = _headers['Access-Control-Allow-Headers'];
      delete _headers['Access-Control-Allow-Headers'];
    }

    if (_headers['Access-Control-Allow-Credentials']) {
      res.headers = res.headers || {};
      res.headers.accessControlAllowCredentials = _headers['Access-Control-Allow-Credentials'] !== 'false';
      delete _headers['Access-Control-Allow-Credentials'];
    }

    if (Object.keys(_headers).length > 0) {
      res.headers!.customResponseHeaders = _headers;
    }

    return res;
  }

  async get(id: string): Promise<ResourceOutputs['ingressRule'] | undefined> {
    const normalizedId = id.replaceAll('/', '--');
    const contents = await this.taskService.getContents(path.join(MOUNT_PATH, id + FILE_SUFFIX));
    if (!contents) {
      return undefined;
    }

    const config = yaml.load(contents) as TraefikFormattedIngressRule;

    if (config.http) {
      let host = '';
      const hostMatches = config.http.routers[normalizedId + ROUTER_SUFFIX].rule.match(/Host\(`([^\s]+)`\)/);
      if (hostMatches && hostMatches.length > 1) {
        host = hostMatches[1];
      }

      let ingressPath = '/';
      const pathMatches = config.http.routers[normalizedId + ROUTER_SUFFIX].rule.match(/PathPrefix\(`([^\s]+)`\)/);
      if (pathMatches && pathMatches.length > 1) {
        ingressPath = pathMatches[1];
      }
      const rootHost = host.split('.').at(-1) || host;

      return {
        id,
        host,
        rootHost,
        port: 80,
        url: `http://${host}:80${ingressPath}`,
        path: ingressPath,
        loadBalancerHostname: '127.0.0.1',
      };
    } else if (config.tcp) {
      let host = '';
      const hostSNIMatches = config.tcp.routers[normalizedId + ROUTER_SUFFIX].rule.match(/HostSNI\(`([^\s]+)`\)/);
      if (hostSNIMatches && hostSNIMatches.length > 1) {
        host = hostSNIMatches[1];
      }

      let ingressPath = '/';
      const pathMatches = config.tcp.routers[normalizedId + ROUTER_SUFFIX].rule.match(/PathPrefix\(`([^\s]+)`\)/);
      if (pathMatches && pathMatches.length > 1) {
        ingressPath = pathMatches[1];
      }
      const rootHost = host.split('.').at(-1) || host;

      return {
        id,
        host,
        rootHost,
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
      const normalizedId = id.replaceAll('/', '--');
      const contents = await this.taskService.getContents(filename);
      const config = yaml.load(contents) as TraefikFormattedIngressRule;

      let host = '';
      let ingressPath = '/';
      if (config.http) {
        const hostMatches = config.http.routers[normalizedId + ROUTER_SUFFIX].rule.match(/Host\(`([^\s]+)`\)/);
        if (hostMatches && hostMatches.length > 1) {
          host = hostMatches[1];
        }

        const pathMatches = config.http.routers[normalizedId + ROUTER_SUFFIX].rule.match(/PathPrefix\(`([^\s]+)`\)/);
        if (pathMatches && pathMatches.length > 1) {
          ingressPath = pathMatches[1];
        }
      } else if (config.tcp) {
        const hostSNIMatches = config.tcp.routers[normalizedId + ROUTER_SUFFIX].rule.match(/HostSNI\(`([^\s]+)`\)/);
        if (hostSNIMatches && hostSNIMatches.length > 1) {
          host = hostSNIMatches[1];
        }

        const pathMatches = config.tcp.routers[normalizedId + ROUTER_SUFFIX].rule.match(/PathPrefix\(`([^\s]+)`\)/);
        if (pathMatches && pathMatches.length > 1) {
          ingressPath = pathMatches[1];
        }
      }
      const rootHost = host.split('.').at(-1) || host;

      return {
        id,
        host,
        rootHost,
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
    let id = inputs.name;
    if (inputs.namespace) {
      id = inputs.namespace + '/' + id;
    }
    const normalizedId = id.replaceAll('/', '--');

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
    if (inputs.path) {
      rules.push('PathPrefix(\\\`' + inputs.path + '\\\`)');
    }

    let entry: TraefikFormattedIngressRule;
    if (isNotHttp) {
      rules.push('HostSNI(\\\`' + host + '\\\`)');
      entry = {
        tcp: {
          routers: {
            [normalizedId + ROUTER_SUFFIX]: {
              rule: rules.join(' && '),
              service: inputs.service.replaceAll('/', '--'),
              tls: {
                passthrough: true,
              },
            },
          },
        },
      };
    } else {
      rules.push('Host(\\\`' + host + '\\\`)');
      entry = {
        http: {
          routers: {
            [normalizedId + ROUTER_SUFFIX]: {
              rule: rules.join(' && '),
              service: inputs.service.replaceAll('/', '--'),
            },
          },
        },
      };

      if (inputs.headers && Object.keys(inputs.headers).length > 0) {
        entry.http!.middlewares = {
          [normalizedId + ROUTER_SUFFIX]: this.headersToMiddleware(inputs.headers),
        };
        entry.http!.routers[normalizedId + ROUTER_SUFFIX].middlewares = [normalizedId + ROUTER_SUFFIX];
      }
    }

    await this.taskService.writeFile(
      path.join(MOUNT_PATH, normalizedId + FILE_SUFFIX),
      yaml.dump(entry),
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
    const rootHost = host.split('.').at(-1) || host;

    subscriber.next(url);
    return {
      id: normalizedId,
      host,
      rootHost,
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
    const normalizedPreviousId = id.replaceAll('/', '--');
    const contents = await this.taskService.getContents(path.join(MOUNT_PATH, id + FILE_SUFFIX));

    const existingConfig = yaml.load(contents) as TraefikFormattedIngressRule;

    let previousService = '';
    if (existingConfig.http) {
      previousService = existingConfig.http.routers[normalizedPreviousId + ROUTER_SUFFIX].service;
    } else if (existingConfig.tcp) {
      previousService = existingConfig.tcp.routers[normalizedPreviousId + ROUTER_SUFFIX].service;
    }

    let newId = id;
    if (inputs.name && inputs.namespace) {
      newId = inputs.namespace + '/' + inputs.name;
    } else if (inputs.name) {
      newId = inputs.name;
    }
    const normalizedNewId = newId.replaceAll('/', '--');

    const hostParts = [];
    if (inputs.subdomain) {
      hostParts.push(inputs.subdomain);
    }

    if (inputs.dnsZone) {
      hostParts.push(inputs.dnsZone);
    }

    const host = hostParts.join('.');

    const rules = [];
    if (inputs.path) {
      rules.push('PathPrefix(\\\`' + inputs.path + '\\\`)');
    }

    const isNotHttp = inputs.protocol && inputs.protocol !== 'http';
    let newEntry: TraefikFormattedIngressRule;
    if (isNotHttp) {
      rules.push('HostSNI(\\\`' + host + '\\\`)');
      newEntry = {
        tcp: {
          routers: {
            [normalizedNewId + ROUTER_SUFFIX]: {
              rule: rules.join(' && '),
              service: inputs.service || previousService,
              tls: {
                passthrough: true,
              },
            },
          },
        },
      };
    } else {
      rules.push('Host(\\\`' + host + '\\\`)');
      newEntry = {
        http: {
          routers: {
            [normalizedNewId + ROUTER_SUFFIX]: {
              rule: rules.join(' && '),
              service: inputs.service || previousService,
            },
          },
        },
      };

      if (inputs.headers && Object.keys(inputs.headers).length > 0) {
        newEntry.http!.middlewares = {
          [normalizedNewId + ROUTER_SUFFIX]: this.headersToMiddleware(inputs.headers as Record<string, string>),
        };
        newEntry.http!.routers[normalizedNewId + ROUTER_SUFFIX].middlewares = [normalizedNewId + ROUTER_SUFFIX];
      }
    }

    if (newId !== id) {
      subscriber.next('Removing old ingressRule: ' + id);
      await this.taskService.deleteFile(path.join(MOUNT_PATH, id + FILE_SUFFIX));
    }

    subscriber.next('Registering new ingressRule: ' + newId);
    await this.taskService.writeFile(path.join(MOUNT_PATH, newId + FILE_SUFFIX), yaml.dump(newEntry));

    let urlPath = inputs.path || '/';
    if (!urlPath.endsWith('/')) {
      urlPath += '/';
    }

    let url = `${inputs.protocol || 'http'}://`;
    if (inputs.username) {
      url += `${inputs.username}:${inputs.password}@`;
    }

    url += `${host}${urlPath}`;
    const rootHost = host.split('.').at(-1) || host;

    subscriber.next(url);
    return {
      id: newId,
      host,
      rootHost,
      port: 80,
      path: urlPath,
      username: inputs.username,
      password: inputs.password,
      url,
      loadBalancerHostname: '127.0.0.1',
    };
  }

  async delete(_subscriber: Subscriber<string>, id: string): Promise<void> {
    await this.taskService.deleteFile(path.join(MOUNT_PATH, id + FILE_SUFFIX));
  }
}
