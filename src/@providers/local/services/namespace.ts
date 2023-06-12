import { Observable } from 'rxjs';
import * as path from 'std/path/mod.ts';
import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ApplyOutputs } from '../../base.service.ts';
import { CrudResourceService } from '../../crud.service.ts';
import { LocalCredentials } from '../credentials.ts';

export class LocalNamespaceService extends CrudResourceService<'namespace', LocalCredentials> {
  get(id: string): Promise<ResourceOutputs['namespace'] | undefined> {
    const file = path.join(this.credentials.directory, id);
    const stat = Deno.lstatSync(file);

    if (!stat.isDirectory) {
      return Promise.resolve(undefined);
    }

    return Promise.resolve({
      id: id,
    });
  }

  list(
    _filterOptions?: Partial<ResourceOutputs['namespace']> | undefined,
    _pagingOptions?: Partial<PagingOptions> | undefined,
  ): Promise<PagingResponse<ResourceOutputs['namespace']>> {
    const fileNames = Deno.readDirSync(this.credentials.directory);

    const namespaces: ResourceOutputs['namespace'][] = [];
    for (const file of fileNames) {
      if (file.isDirectory) {
        namespaces.push({
          id: file.name,
        });
      }
    }

    return Promise.resolve({
      total: namespaces.length,
      rows: namespaces,
    });
  }

  create(inputs: ResourceInputs['namespace']): Observable<ApplyOutputs<'namespace'>> {
    return new Observable((subscriber) => {
      try {
        const startTime = Date.now();
        subscriber.next({
          status: {
            state: 'applying',
            message: 'Creating namespace',
            startTime,
          },
        });

        const namespace = path.join(this.credentials.directory, inputs.name);
        Deno.mkdirSync(namespace);

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
      } catch (err) {
        subscriber.error(err);
      }
    });
  }

  update(_id: string, _inputs: ResourceInputs['namespace']): Observable<ApplyOutputs<'namespace'>> {
    return new Observable((subscriber) => {
      subscriber.error(new Error('Method not implemented'));
    });
  }

  delete(id: string): Observable<ApplyOutputs<'namespace'>> {
    return new Observable((subscriber) => {
      const startTime = Date.now();
      subscriber.next({
        status: {
          state: 'destroying',
          message: 'Removing namespace',
          startTime,
        },
      });

      const namespace = path.join(this.credentials.directory, id);
      Deno.removeSync(namespace, { recursive: true });

      subscriber.next({
        status: {
          state: 'complete',
          message: '',
          startTime,
          endTime: Date.now(),
        },
      });
      subscriber.complete();
    });
  }
}
