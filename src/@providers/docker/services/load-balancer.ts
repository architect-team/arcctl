import { Observable } from 'rxjs';
import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { DeepPartial } from '../../../utils/types.ts';
import { ApplyOutputs } from '../../base.service.ts';
import { CrudResourceService } from '../../crud.service.ts';
import { ProviderStore } from '../../store.ts';
import { DockerCredentials } from '../credentials.ts';
import { DockerDeploymentService } from './deployment.ts';
import { DockerVolumeService } from './volume.ts';

export class DockerLoadBalancerService extends CrudResourceService<'loadBalancer', DockerCredentials> {
  volumeService: DockerVolumeService;
  deploymentService: DockerDeploymentService;

  public constructor(accountName: string, credentials: DockerCredentials, providerStore: ProviderStore) {
    super(accountName, credentials, providerStore);
    this.volumeService = new DockerVolumeService(accountName, credentials, providerStore);
    this.deploymentService = new DockerDeploymentService(accountName, credentials, providerStore);
  }

  async get(id: string): Promise<ResourceOutputs['loadBalancer'] | undefined> {
    const listRes = await this.list();
    return listRes.rows.find((row) => row.id === id);
  }

  /**
   * Search for resources matching the specified options
   */
  async list(
    filterOptions?: Partial<ResourceOutputs['loadBalancer']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['loadBalancer']>> {
    const res = await this.deploymentService.list({
      labels: {
        'arcctl.architect.io.type': 'loadBalancer',
      },
    });

    return {
      total: res.total,
      rows: res.rows.map((row) => ({
        id: row.labels?.['arcctl.architect.io.name'] || 'unknown',
        loadBalancerType: row.labels?.['arcctl.architect.io.loadBalancerType'] || 'unknown',
        address: `127.0.0.1:80`,
      })),
    };
  }

  create(inputs: ResourceInputs['loadBalancer']): Observable<ApplyOutputs<'loadBalancer'>> {
    return new Observable<ApplyOutputs<'loadBalancer'>>((subscriber) => {
      switch (inputs.loadBalancerType) {
        case 'traefik': {
          const startTime = Date.now();
          subscriber.next({
            status: {
              state: 'applying',
              message: 'Creating service registry volume',
              startTime,
            },
          });

          let volumeRes: ApplyOutputs<'volume'> = {
            status: { state: 'pending' },
          };
          return this.volumeService.create({
            type: 'volume',
            name: `${inputs.name}-lb-volume`,
            account: this.accountName,
          }).subscribe({
            next: (res) => {
              volumeRes = res;
            },
            complete: () => {
              if (!volumeRes.outputs) {
                subscriber.next({
                  status: {
                    state: 'error',
                    message: 'Failed to create volume',
                    startTime,
                    endTime: Date.now(),
                  },
                });
                subscriber.error(new Error(`Failed to create volume for service registry`));
                return;
              }

              subscriber.next({
                status: {
                  state: 'applying',
                  message: 'Starting load balancer',
                  startTime,
                },
              });

              this.deploymentService.create({
                type: 'deployment',
                account: this.accountName,
                image: 'traefik:v2.10',
                name: `${inputs.name}-lb`,
                replicas: 1,
                volume_mounts: [{
                  mount_path: '/etc/traefik',
                  readonly: true,
                  volume: volumeRes.outputs.id,
                }],
                labels: {
                  'arcctl.architect.io.type': 'loadBalancer',
                  'arcctl.architect.io.name': inputs.name,
                  'arcctl.architect.io.volume': volumeRes.outputs.id,
                  'arcctl.architect.io.loadBalancerType': 'traefik',
                },
                namespace: inputs.namespace,
                command: [
                  '--providers.file.directory=/etc/traefik',
                  '--providers.file.watch=true',
                  '--api.insecure=true',
                ],
                ports: ['80:80', '8080:8080'],
              }).subscribe({
                next: () => {
                },
                complete: () => {
                  subscriber.next({
                    status: {
                      state: 'complete',
                      message: '',
                      startTime,
                      endTime: Date.now(),
                    },
                    outputs: {
                      id: inputs.name,
                      address: '127.0.0.1:80',
                      loadBalancerType: 'traefik',
                    },
                    state: {
                      id: inputs.name,
                      address: '127.0.0.1:80',
                      loadBalancerType: 'traefik',
                    },
                  });

                  subscriber.complete();
                },
                error: subscriber.error,
              });
            },
            error: subscriber.error,
          });
        }
        default: {
          subscriber.error(new Error(`Unsupported loadBalancerType: ${inputs.loadBalancerType}`));
        }
      }
    });
  }

  update(id: string, inputs: DeepPartial<ResourceInputs['loadBalancer']>): Observable<ApplyOutputs<'loadBalancer'>> {
    return new Observable<ApplyOutputs<'loadBalancer'>>((subscriber) => {
      switch (inputs.loadBalancerType) {
        case 'traefik': {
          const startTime = Date.now();
          subscriber.next({
            status: {
              state: 'applying',
              message: 'Creating service registry volume',
              startTime,
            },
          });

          let volumeRes: ApplyOutputs<'volume'> = {
            status: { state: 'pending' },
          };
          return this.volumeService.update(`${id}-lb-volume`, {
            type: 'volume',
            name: `${inputs.name || id}-lb-volume`,
            account: this.accountName,
          }).subscribe({
            next: (res) => {
              volumeRes = res;
            },
            complete: () => {
              if (!volumeRes.outputs) {
                subscriber.error(new Error(`Failed to update volume for service registry`));
                return;
              }

              subscriber.next({
                status: {
                  state: 'applying',
                  message: 'Starting load balancer',
                  startTime,
                },
              });

              this.deploymentService.update(`${id}-lb`, {
                type: 'deployment',
                image: 'traefik:v2.10',
                name: `${inputs.name || id}-lb`,
                replicas: 1,
                volume_mounts: [{
                  mount_path: '/etc/traefik',
                  readonly: true,
                  volume: volumeRes.outputs.id,
                }],
                labels: {
                  'arcctl.architect.io.type': 'loadBalancer',
                  'arcctl.architect.io.volume': volumeRes.outputs.id,
                  'arcctl.architect.io.loadBalancerType': 'traefik',
                  ...(inputs.name ? { 'arcctl.architect.io.name': inputs.name } : {}),
                },
                ...(inputs.namespace ? { namespace: inputs.namespace } : {}),
                command: [
                  '--providers.file.directory=/etc/traefik',
                  '--providers.file.watch=true',
                  '--api.insecure=true',
                ],
                ports: ['80:80', '8080:8080'],
              }).subscribe({
                next: () => {
                },
                complete: () => {
                  subscriber.next({
                    status: {
                      state: 'complete',
                      message: '',
                      startTime,
                      endTime: Date.now(),
                    },
                    outputs: {
                      id,
                      address: '127.0.0.1:80',
                      loadBalancerType: 'traefik',
                    },
                    state: {
                      id,
                      address: '127.0.0.1:80',
                      loadBalancerType: 'traefik',
                    },
                  });

                  subscriber.complete();
                },
                error: subscriber.error,
              });
            },
            error: subscriber.error,
          });
        }
        default: {
          subscriber.error(new Error(`Unsupported loadBalancerType: ${inputs.loadBalancerType}`));
        }
      }
    });
  }

  delete(id: string): Observable<ApplyOutputs<'loadBalancer'>> {
    return new Observable((subscriber) => {
      this.get(id).then(async (res) => {
        if (!res) {
          subscriber.error(new Error(`No loadBalancer with the ID: ${id}`));
          return;
        }

        const startTime = Date.now();
        switch (res.loadBalancerType) {
          case 'traefik': {
            subscriber.next({
              status: {
                state: 'destroying',
                message: 'Winding down load balancer',
                startTime,
              },
            });

            const deployment = await this.deploymentService.get(`${res.id}-lb`);
            if (!deployment?.labels?.['arcctl.architect.io.volume']) {
              subscriber.error(new Error(`Load balancer is missing metadata needed to clean up its volume`));
              return;
            }
            const volumeId = deployment.labels['arcctl.architect.io.volume'];

            this.deploymentService.delete(`${res.id}-lb`).subscribe({
              complete: () => {
                subscriber.next({
                  status: {
                    state: 'destroying',
                    message: 'Cleaning up service registry volume',
                    startTime,
                  },
                });

                this.volumeService.delete(volumeId).subscribe({
                  complete: () => {
                    subscriber.next({
                      status: {
                        state: 'complete',
                        message: '',
                        startTime,
                        endTime: Date.now(),
                      },
                    });
                    subscriber.complete();
                  },
                  error: subscriber.error,
                });
              },
              error: subscriber.error,
            });
            break;
          }
          default: {
            subscriber.error(new Error(`Unsupported load balancer type: ${res.loadBalancerType}`));
          }
        }
      });
    });
  }
}
