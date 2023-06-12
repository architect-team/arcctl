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

const FILE_SUFFIX = '-service.yml';
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
    const contents = await this.taskService.getContents(id);
    if (!contents) {
      return undefined;
    }

    const entry = yaml.load(contents) as TraefikFormattedService;

    let host = '';
    if (entry.http.routers[id]) {
      const hostMatches = entry.http.routers[id].rule.match(/Host\("?(.*)"?\)/);
      if (hostMatches && hostMatches.length > 1) {
        host = hostMatches[1];
      }
    }

    return {
      id,
      host,
      port: 80,
      protocol: 'http',
      url: `http://${host}`,
    };
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['service']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['service']>> {
    const configFiles = await this.taskService.listConfigFiles(MOUNT_PATH, FILE_SUFFIX);
    const configs = await Promise.all<ResourceOutputs['service']>(configFiles.map(async (filename) => {
      const id = filename.replace(new RegExp('^' + MOUNT_PATH + '(.*)' + FILE_SUFFIX + '$'), '$1');
      const contents = await this.taskService.getContents(id);
      const config = yaml.load(contents) as TraefikFormattedService;

      let host = '';
      if (config.http.routers[id]) {
        const hostMatches = config.http.routers[id].rule.match(/Host\("?(.*)"?\)/);
        if (hostMatches && hostMatches.length > 1) {
          host = hostMatches[1];
        }
      }

      return {
        id,
        host,
        port: 80,
        protocol: 'http',
        url: `http://${host}`,
      };
    }));

    return {
      total: configs.length,
      rows: configs,
    };
  }

  async create(subscriber: Subscriber<string>, inputs: ResourceInputs['service']): Promise<ResourceOutputs['service']> {
    const normalizedId = inputs.name.replaceAll('/', '--');

    let url = `${inputs.target_deployment}:${inputs.target_port}`;
    if (inputs.external_hostname) {
      url = inputs.external_hostname;
    }

    const entry: TraefikFormattedService = {
      http: {
        routers: {
          [normalizedId]: {
            rule: `Host("${normalizedId}")`,
            service: normalizedId,
          },
        },
        services: {
          [normalizedId]: {
            loadBalancer: {
              servers: [{
                url,
              }],
            },
          },
        },
      },
    };

    await this.taskService.writeFile(path.join(MOUNT_PATH, normalizedId + FILE_SUFFIX), yaml.dump(entry));
    return {
      id: normalizedId,
      host: normalizedId,
      port: 80,
      protocol: 'http',
      url: `http://${normalizedId}`,
    };
  }

  async update(
    subscriber: Subscriber<string>,
    id: string,
    inputs: DeepPartial<ResourceInputs['service']>,
  ): Promise<ResourceOutputs['service']> {
    const contents = await this.taskService.getContents(path.join(MOUNT_PATH, id + FILE_SUFFIX));
    const existingConfig = yaml.load(contents) as TraefikFormattedService;
    const previousName = Object.keys(existingConfig.http.routers)[0];
    const previousServers = existingConfig.http.services[previousName].loadBalancer.servers;
    const normalizedId = inputs.name?.replaceAll('/', '--') || previousName;
    const newEntry: TraefikFormattedService = {
      http: {
        routers: {
          [normalizedId]: {
            rule: `Host("${normalizedId}")`,
            service: normalizedId,
          },
        },
        services: {
          [normalizedId]: {
            loadBalancer: {
              servers: inputs.target_port
                ? [{
                  url: `127.0.0.1:${inputs.target_port}`,
                }]
                : previousServers,
            },
          },
        },
      },
    };

    if (inputs.name && inputs.name.replaceAll('/', '--') !== previousName) {
      subscriber.next('Removing old service');
      await this.taskService.deleteFile(path.join(MOUNT_PATH, previousName + FILE_SUFFIX));
      subscriber.next('Registering new service');
    }

    await this.taskService.writeFile(path.join(MOUNT_PATH, normalizedId + FILE_SUFFIX), yaml.dump(newEntry));

    return {
      id: normalizedId,
      host: normalizedId,
      port: 80,
      protocol: 'http',
      url: `http://${normalizedId}`,
    };
  }

  async delete(subscriber: Subscriber<string>, id: string): Promise<void> {
    await this.taskService.deleteFile(path.join(MOUNT_PATH, id.replaceAll('/', '--') + FILE_SUFFIX));
  }
}
