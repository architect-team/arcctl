import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { exec } from '../../../utils/command.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { DeepPartial } from '../../../utils/types.ts';
import { CrudResourceService } from '../../crud.service.ts';
import { ApplyOutputs } from '../../base.service.ts';
import { DockerCredentials } from '../credentials.ts';
import { Observable } from 'rxjs';

type DockerNetwork = {
  CreatedAt: string;
  Driver: string;
  ID: string;
  Name: string;
  Scope: string;
  Internal: string;
  IPv6: string;
};

export class DockerNamespaceService extends CrudResourceService<'namespace', DockerCredentials> {
  async get(id: string): Promise<ResourceOutputs['namespace'] | undefined> {
    const results = await this.list();
    return results.rows.find((r) => r.id === id);
  }

  async list(
    _filterOptions?: Partial<ResourceOutputs['namespace']> | undefined,
    _pagingOptions?: Partial<PagingOptions> | undefined,
  ): Promise<PagingResponse<ResourceOutputs['namespace']>> {
    const { stdout } = await exec('docker', { args: ['network', 'ls', '--format', 'json'] });
    const rawOutput: DockerNetwork[] = JSON.parse(`[${stdout.split('\n').join(',')}]`);
    return {
      total: rawOutput.length,
      rows: rawOutput.map((r) => ({
        id: r.Name,
      })),
    };
  }

  create(inputs: ResourceInputs['namespace']): Observable<ApplyOutputs<'namespace'>> {
    return new Observable((subscriber) => {
      const startTime = Date.now();
      subscriber.next({
        status: {
          state: 'applying',
          message: 'Creating namespace',
          startTime,
        },
      });

      exec('docker', { args: ['network', 'create', inputs.name] })
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

  update(_id: string, _inputs: ResourceInputs['namespace']): Observable<ApplyOutputs<'namespace'>> {
    throw new Error('Not yet implemented');
  }

  delete(id: string): Observable<ApplyOutputs<'namespace'>> {
    return new Observable((subscriber) => {
      const startTime = Date.now();
      subscriber.next({
        status: {
          state: 'destroying',
          message: 'Destroying namespace',
          startTime,
        },
      });

      exec('docker', { args: ['network', 'rm', id] })
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
