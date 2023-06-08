import { Observable } from 'rxjs';
import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { exec } from '../../../utils/command.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { DeepPartial } from '../../../utils/types.ts';
import { ApplyOutputs } from '../../base.service.ts';
import { CrudResourceService } from '../../crud.service.ts';
import { DockerCredentials } from '../credentials.ts';

type DockerVolume = {
  Availability: string;
  Driver: string;
  Group: string;
  Labels: string;
  Links: string;
  Mountpoint: string;
  Name: string;
  Scope: string;
  Size: string;
  Status: string;
};

export class DockerVolumeService extends CrudResourceService<'volume', DockerCredentials> {
  async get(id: string): Promise<ResourceOutputs['volume'] | undefined> {
    const results = await this.list();
    return results.rows.find((r) => r.id === id);
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['volume']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['volume']>> {
    const { stdout } = await exec('docker', { args: ['volume', 'ls', '--format', 'json'] });
    const rows = stdout.includes('\n') ? stdout.split('\n').filter((row) => Boolean(row)) : [stdout];
    const rawOutput: DockerVolume[] = JSON.parse(`[${rows.join(',')}]`);
    return {
      total: rawOutput.length,
      rows: rawOutput.map((r) => ({
        id: r.Name,
      })),
    };
  }

  create(inputs: ResourceInputs['volume']): Observable<ApplyOutputs<'volume'>> {
    return new Observable((subscriber) => {
      const startTime = Date.now();
      subscriber.next({
        status: {
          state: 'applying',
          message: 'Creating volume',
          startTime,
        },
      });

      exec('docker', { args: ['volume', 'create', inputs.name] })
        .then(() => {
          subscriber.next({
            status: {
              state: 'complete',
              message: '',
              startTime,
              endTime: Date.now(),
            },
            outputs: {
              id: inputs.name,
            },
            state: {
              id: inputs.name,
            },
          });

          subscriber.complete();
        })
        .catch(subscriber.error);
    });
  }

  update(id: string, inputs: DeepPartial<ResourceInputs['volume']>): Observable<ApplyOutputs<'volume'>> {
    return new Observable((subscriber) => {
      subscriber.next({
        status: {
          state: 'complete',
          message: 'Volumes cannot be updated. No action was taken.',
          startTime: Date.now(),
          endTime: Date.now(),
        },
        outputs: {
          id,
        },
        state: {
          id,
        },
      });

      subscriber.complete();
    });
  }

  delete(id: string): Observable<ApplyOutputs<'volume'>> {
    return new Observable((subscriber) => {
      const startTime = Date.now();
      subscriber.next({
        status: {
          state: 'destroying',
          message: 'Destroying namespace',
          startTime,
        },
      });

      exec('docker', { args: ['volume', 'rm', id] })
        .then(() => {
          subscriber.next({
            status: {
              state: 'complete',
              message: '',
              startTime,
              endTime: Date.now(),
            },
          });

          subscriber.complete();
        })
        .catch(subscriber.error);
    });
  }
}
