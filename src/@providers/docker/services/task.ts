import { Observable } from 'rxjs';
import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { exec } from '../../../utils/command.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { DeepPartial } from '../../../utils/types.ts';
import { ApplyOutputs } from '../../base.service.ts';
import { CrudResourceService } from '../../crud.service.ts';
import { DockerCredentials } from '../credentials.ts';

export class DockerTaskService extends CrudResourceService<'task', DockerCredentials> {
  get(_id: string): Promise<ResourceOutputs['task'] | undefined> {
    return Promise.resolve(undefined);
  }

  list(
    _filterOptions?: Partial<ResourceOutputs['task']> | undefined,
    _pagingOptions?: Partial<PagingOptions> | undefined,
  ): Promise<PagingResponse<ResourceOutputs['task']>> {
    return Promise.resolve({
      total: 0,
      rows: [],
    });
  }

  create(inputs: ResourceInputs['task']): Observable<ApplyOutputs<'task'>> {
    return new Observable((subscriber) => {
      const startTime = Date.now();
      subscriber.next({
        status: {
          state: 'applying',
          message: 'Running task',
          startTime: startTime,
        },
      });

      const args = ['run', '--rm'];
      if (inputs.namespace) {
        args.push('--network', inputs.namespace);
      }

      if (inputs.environment) {
        for (const [key, value] of Object.entries(inputs.environment)) {
          args.push('--env', `${key}="${String(value)}"`);
        }
      }

      if (inputs.volume_mounts) {
        for (const mount of inputs.volume_mounts) {
          args.push('--volume', `${mount.volume}:${mount.mount_path}`);
        }
      }

      if (inputs.entrypoint) {
        args.push(
          '--entrypoint',
          typeof inputs.entrypoint === 'string' ? `${inputs.entrypoint}` : `${inputs.entrypoint.join(' ')}`,
        );
      }

      const labels = inputs.labels || {};
      for (const [key, value] of Object.entries(labels)) {
        args.push('--label', `${key}=${value}`);
      }

      args.push(inputs.image);

      if (inputs.command) {
        args.push(...(typeof inputs.command === 'string' ? [inputs.command] : inputs.command));
      }

      exec('docker', { args }).then(({ code, stdout, stderr }) => {
        if (code !== 0) {
          subscriber.error(new Error(stderr));
        } else {
          subscriber.next({
            status: {
              state: 'complete',
              message: '',
              startTime,
              endTime: Date.now(),
            },
            outputs: {
              id: 'task',
              stdout,
              stderr,
            },
            state: {
              id: 'task',
              labels,
            },
          });

          subscriber.complete();
        }
      });
    });
  }

  update(
    id: string,
    _inputs: DeepPartial<ResourceInputs['task']>,
  ): Observable<ApplyOutputs<'task'>> {
    return new Observable((subscriber) => {
      subscriber.next({
        status: {
          state: 'complete',
          message: 'Tasks cannot be updated. No action was taken.',
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

  delete(_id: string): Observable<ApplyOutputs<'task'>> {
    return new Observable((subscriber) => {
      subscriber.next({
        status: {
          state: 'complete',
          message: 'Tasks cannot be deleted. No action was taken.',
          startTime: Date.now(),
          endTime: Date.now(),
        },
      });

      subscriber.complete();
    });
  }
}
