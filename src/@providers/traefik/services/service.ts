import yaml from 'js-yaml';
import { map, Observable } from 'rxjs';
import * as path from 'std/path/mod.ts';
import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { DeepPartial } from '../../../utils/types.ts';
import { ApplyOutputs, WritableResourceService } from '../../base.service.ts';
import { CrudResourceService } from '../../crud.service.ts';
import { ProviderStore } from '../../store.ts';
import { TraefikCredentials } from '../credentials.ts';

const FILE_SUFFIX = '-service.yml';

type TraefikServiceEntry = {
  http: {
    routers: {
      [key: string]: {
        rule: string;
        service: string;
      };
    };
    services: {
      [key: string]: {
        loadBalancer: {
          servers: Array<{
            url: string;
          }>;
        };
      };
    };
  };
};

export class TraefikServiceService extends CrudResourceService<'service', TraefikCredentials> {
  private taskService: WritableResourceService<'task', any>;

  public constructor(name: string, credentials: TraefikCredentials, providerStore: ProviderStore) {
    super(name, credentials, providerStore);

    const account = providerStore.getProvider(credentials.account);
    if (!account) {
      throw new Error(`Invalid account name: ${credentials.account}`);
    } else if (!account.resources.task || !('apply' in account.resources.task)) {
      throw new Error(`The ${account.name} account cannot run tasks`);
    }

    this.taskService = account.resources.task as WritableResourceService<'task', any>;
  }

  private listConfigFiles(
    filterOptions?: Partial<ResourceOutputs['service']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<string[]> {
    return new Promise((resolve, reject) => {
      let stdout: string | undefined;
      this.taskService.apply({
        type: 'task',
        account: this.credentials.account,
        image: 'alpine:latest',
        command: ['find', '/etc/traefik/*' + FILE_SUFFIX, '-maxdepth', '1', '-type', 'f'],
        volume_mounts: [{
          mount_path: '/etc/traefik',
          volume: this.credentials.volume,
        }],
      }, {
        providerStore: this.providerStore,
        cwd: path.resolve('.terraform'),
        id: 'list-traefik-services',
      }).subscribe({
        next: (res) => {
          stdout = res.outputs?.stdout;
        },
        complete: () => {
          resolve(stdout ? stdout.split('\n') : []);
        },
        error: reject,
      });
    });
  }

  private getFileContents(id: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      let stdout = '';
      this.taskService.apply({
        type: 'task',
        account: this.credentials.account,
        image: 'alpine:latest',
        command: ['cat', path.join('/etc/traefik', id + FILE_SUFFIX)],
        volume_mounts: [{
          mount_path: '/etc/traefik',
          volume: this.credentials.volume,
        }],
      }, {
        providerStore: this.providerStore,
        cwd: path.resolve('.terraform'),
        id: 'get-traefik-config-contents',
      }).subscribe({
        next: (res) => {
          stdout = res.outputs?.stdout || '';
        },
        complete: () => {
          resolve(stdout || '');
        },
        error: reject,
      });
    });
  }

  private writeTraefikConfig(id: string, entry: TraefikServiceEntry) {
    return this.taskService.apply({
      type: 'task',
      account: this.credentials.account,
      image: 'alpine:latest',
      command: [
        'echo',
        yaml.dump(entry),
        '>',
        path.join('/etc/traefik', id + FILE_SUFFIX),
      ],
      volume_mounts: [{
        mount_path: '/etc/traefik',
        volume: this.credentials.volume,
      }],
    }, {
      cwd: path.resolve('.terraform'),
      id: 'create-traefik-service',
      providerStore: this.providerStore,
    }).pipe(map((val) => ({
      status: val.status,
      state: val.state,
      outputs: {
        id,
        host: '',
        port: 80,
        protocol: 'http',
        url: '',
      },
    })));
  }

  private deleteTraefikConfig(id: string) {
    return this.taskService.apply({
      type: 'task',
      account: this.credentials.account,
      image: 'alpine:latest',
      command: [
        'rm',
        path.join('/etc/traefik', id + FILE_SUFFIX),
      ],
      volume_mounts: [{
        mount_path: '/etc/traefik',
        volume: this.credentials.volume,
      }],
    }, {
      cwd: path.resolve('.terraform'),
      id: 'create-traefik-service',
      providerStore: this.providerStore,
    }).pipe(map((val) => ({
      status: val.status,
    })));
  }

  async get(id: string): Promise<ResourceOutputs['service'] | undefined> {
    const contents = await this.getFileContents(id);
    if (!contents) {
      return undefined;
    }

    const entry = yaml.load(contents) as TraefikServiceEntry;
    return {
      id,
      host: '',
      port: 80,
      protocol: 'http',
      url: '',
    };
  }

  /**
   * Search for resources matching the specified options
   */
  async list(
    filterOptions?: Partial<ResourceOutputs['service']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['service']>> {
    const configFiles = await this.listConfigFiles(filterOptions, pagingOptions);
    const configs = await Promise.all<ResourceOutputs['service']>(configFiles.map(async (filename) => {
      const contents = await this.getFileContents(filename);
      const config = yaml.load(contents) as TraefikServiceEntry;
      return {
        id: filename,
        host: '',
        port: 80,
        protocol: '',
        url: '',
      };
    }));

    return {
      total: configs.length,
      rows: configs,
    };
  }

  create(inputs: ResourceInputs['service']): Observable<ApplyOutputs<'service'>> {
    return this.writeTraefikConfig(inputs.name, {
      http: {
        routers: {
          [inputs.name]: {
            rule: `Host(\`${inputs.name}\`)`,
            service: inputs.name,
          },
        },
        services: {
          [inputs.name]: {
            loadBalancer: {
              servers: [{
                url: `127.0.0.1:${inputs.target_port}`,
              }],
            },
          },
        },
      },
    });
  }

  update(id: string, inputs: DeepPartial<ResourceInputs['service']>): Observable<ApplyOutputs<'service'>> {
    return new Observable<ApplyOutputs<'service'>>((subscriber) => {
      this.getFileContents(`${id}.yml`).then((contents) => {
        const existingConfig = yaml.load(contents) as TraefikServiceEntry;
        const previousName = Object.keys(existingConfig.http.routers)[0];
        const previousServers = existingConfig.http.services[previousName].loadBalancer.servers;
        const newEntry: TraefikServiceEntry = {
          http: {
            routers: {
              [inputs.name || previousName]: {
                rule: `Host(\`${inputs.name || previousName}\`)`,
                service: inputs.name || previousName,
              },
            },
            services: {
              [inputs.name || previousName]: {
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

        if (inputs.name !== previousName) {
          this.deleteTraefikConfig(previousName).subscribe({
            complete: () => {
              return this.writeTraefikConfig(inputs.name || previousName, newEntry).subscribe(subscriber);
            },
            error: subscriber.error,
          });
        }
      }).catch(subscriber.error);
    });
  }

  delete(id: string): Observable<ApplyOutputs<'service'>> {
    return this.deleteTraefikConfig(id);
  }
}
