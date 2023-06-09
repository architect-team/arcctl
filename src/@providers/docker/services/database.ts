import { lastValueFrom, Observable } from 'rxjs';
import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { DeepPartial } from '../../../utils/types.ts';
import { ApplyOutputs } from '../../base.service.ts';
import { CrudResourceService } from '../../crud.service.ts';
import { ProviderStore } from '../../store.ts';
import { DockerCredentials } from '../credentials.ts';
import { DockerDeploymentService } from './deployment.ts';
import { DockerVolumeService } from './volume.ts';

export class DockerDatabaseService extends CrudResourceService<'database', DockerCredentials> {
  volumeService: DockerVolumeService;
  deploymentService: DockerDeploymentService;

  public constructor(accountName: string, credentials: DockerCredentials, providerStore: ProviderStore) {
    super(accountName, credentials, providerStore);
    this.volumeService = new DockerVolumeService(accountName, credentials, providerStore);
    this.deploymentService = new DockerDeploymentService(accountName, credentials, providerStore);
  }

  async get(id: string): Promise<ResourceOutputs['database'] | undefined> {
    const listRes = await this.list();
    return listRes.rows.find((row) => row.id === id);
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['database']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['database']>> {
    const res = await this.deploymentService.list({
      labels: {
        'arcctl.architect.io.type': 'database',
      },
    });

    return {
      total: res.total,
      rows: res.rows.map((row) => ({
        id: row.labels?.['arcctl.architect.io.name'] || 'unknown',
        host: 'localhost',
        port: 5432,
        username: 'architect',
        password: 'architect',
        protocol: 'postgresql',
      })),
    };
  }

  create(inputs: ResourceInputs['database']): Observable<ApplyOutputs<'database'>> {
    return new Observable((subscriber) => {
      const startTime = Date.now();

      subscriber.next({
        status: {
          state: 'applying',
          message: 'Creating volume to store data on',
          startTime,
        },
      });

      const normalizedName = inputs.name.replaceAll('/', '--');
      lastValueFrom(this.volumeService.create({
        type: 'volume',
        name: normalizedName,
        account: this.accountName,
      })).then(async (volumeRes) => {
        try {
          subscriber.next({
            status: {
              state: 'applying',
              message: 'Starting database server',
              startTime,
            },
          });

          const volume_mounts = [];
          if (inputs.databaseType === 'postgres' && volumeRes.outputs?.id) {
            volume_mounts.push({
              volume: volumeRes.outputs.id,
              mount_path: '/var/lib/postgresql',
              readonly: false,
            });
          }

          await lastValueFrom(this.deploymentService.create({
            type: 'deployment',
            account: this.accountName,
            name: normalizedName,
            image: `${inputs.databaseType}:${inputs.databaseVersion}`,
            volume_mounts,
            environment: {
              POSTGRES_USER: 'architect',
              POSTGRES_PASSWORD: 'architect',
              POSTGRES_DB: 'architect',
            },
            labels: {
              'arcctl.architect.io.type': 'database',
              'arcctl.architect.io.name': inputs.name,
              'arcctl.architect.io.volume': volumeRes.outputs?.id || '',
              'arcctl.architect.io.databaseType': inputs.databaseType,
              'arcctl.architect.io.databaseVersion': inputs.databaseVersion,
            },
            exposed_ports: [{
              port: 5432,
              target_port: 5432,
            }],
          }));

          subscriber.next({
            status: {
              state: 'complete',
              startTime,
              endTime: Date.now(),
            },
            outputs: {
              id: inputs.name,
              host: 'localhost',
              port: 5432,
              username: 'architect',
              password: 'architect',
              protocol: 'postgresql',
            },
          });

          subscriber.complete();
        } catch (err) {
          subscriber.next({
            status: {
              state: 'error',
              message: 'message' in err ? err.message : err,
              startTime,
              endTime: Date.now(),
            },
          });

          subscriber.error(err);
        }
      }).catch((err) => {
        subscriber.next({
          status: {
            state: 'error',
            message: 'message' in err ? err.message : err,
            startTime,
            endTime: Date.now(),
          },
        });

        subscriber.error(err);
      });
    });
  }

  update(id: string, inputs: DeepPartial<ResourceInputs['database']>): Observable<ApplyOutputs<'database'>> {
    return new Observable((subscriber) => {
      const startTime = Date.now();
      subscriber.next({
        status: {
          state: 'applying',
          startTime,
        },
      });

      this.deploymentService.list({
        labels: {
          'arcctl.architect.io.type': 'database',
        },
      }).then(async (allDbs) => {
        if (allDbs.total === 0) {
          subscriber.next({
            status: {
              state: 'error',
              message: 'No databases found',
              startTime,
              endTime: Date.now(),
            },
          });
          subscriber.error(`No databases matching ID: ${id}`);
          return;
        }

        const existingDb = allDbs.rows.find((db) => db.id === id);
        if (!existingDb) {
          console.log(allDbs);
          subscriber.next({
            status: {
              state: 'error',
              message: 'Database not found',
              startTime,
              endTime: Date.now(),
            },
          });
          subscriber.error(`No databases matching ID: ${id}`);
          return;
        }

        const normalizedName = inputs.name?.replaceAll('/', '--') || existingDb.id;

        const volumeId = existingDb.labels?.['arcctl.architect.io.volume'];
        const volume_mounts = [];
        if (volumeId) {
          subscriber.next({
            status: {
              state: 'applying',
              message: 'Updating storage volume',
              startTime,
            },
          });

          const existingVolume = await this.volumeService.get(volumeId);
          let volumeApplyOutputs: ApplyOutputs<'volume'>;
          if (!existingVolume) {
            volumeApplyOutputs = await lastValueFrom(this.volumeService.create({
              type: 'volume',
              name: normalizedName,
              account: this.accountName,
            }));
          } else {
            volumeApplyOutputs = await lastValueFrom(this.volumeService.update(volumeId, {
              account: this.accountName,
              name: normalizedName,
              type: 'volume',
            }));
          }

          if (inputs.databaseType === 'postgres' && volumeApplyOutputs.outputs?.id) {
            volume_mounts.push({
              volume: volumeApplyOutputs.outputs.id,
              mount_path: '/var/lib/postgresql',
              readonly: false,
            });
          }
        }

        await lastValueFrom(this.deploymentService.update(existingDb.id, {
          type: 'deployment',
          account: this.accountName,
          name: normalizedName,
          image: `${inputs.databaseType}:${inputs.databaseVersion}`,
          volume_mounts,
          environment: {
            POSTGRES_USER: 'architect',
            POSTGRES_PASSWORD: 'architect',
            POSTGRES_DB: 'architect',
          },
          labels: {
            'arcctl.architect.io.type': 'database',
            'arcctl.architect.io.name': inputs.name || existingDb.labels?.['arcctl.architect.io.name'],
            ...(volume_mounts.length > 0 ? { 'arcctl.architect.io.volume': volume_mounts[0].volume } : {}),
            'arcctl.architect.io.databaseType': inputs.databaseType ||
              existingDb.labels?.['arcctl.architect.io.databaseType'],
            'arcctl.architect.io.databaseVersion': inputs.databaseVersion ||
              existingDb.labels?.['arcctl.architect.io.databaseVersion'],
          },
          exposed_ports: [{
            port: 5432,
            target_port: 5432,
          }],
        }));

        subscriber.next({
          status: {
            state: 'complete',
            startTime,
            endTime: Date.now(),
          },
          outputs: {
            id: normalizedName,
            host: 'localhost',
            port: 5432,
            username: 'architect',
            password: 'architect',
            protocol: 'postgresql',
          },
        });

        subscriber.complete();
      }).catch(subscriber.error);
    });
  }

  delete(id: string): Observable<ApplyOutputs<'database'>> {
    return new Observable((subscriber) => {
      this.get(id).then(async (res) => {
        if (!res) {
          subscriber.error(new Error(`No database with the ID: ${id}`));
          return;
        }

        const startTime = Date.now();
        switch (res.protocol) {
          case 'postgresql': {
            subscriber.next({
              status: {
                state: 'destroying',
                message: 'Winding down database server',
                startTime,
              },
            });

            const deployment = await this.deploymentService.get(res.id);
            if (!deployment?.labels?.['arcctl.architect.io.volume']) {
              subscriber.error(new Error(`Database is missing metadata needed to clean up its volume`));
              return;
            }
            const volumeId = deployment.labels['arcctl.architect.io.volume'];

            this.deploymentService.delete(res.id).subscribe({
              complete: () => {
                subscriber.next({
                  status: {
                    state: 'destroying',
                    message: 'Cleaning up database volume',
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
            subscriber.error(new Error(`Unsupported database type: ${res.protocol}`));
          }
        }
      });
    });
  }
}
