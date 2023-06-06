import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { CrudResourceService } from '../../crud.service.ts';
import { LocalCredentials } from '../credentials.ts';
import * as path from 'std/path/mod.ts';
import { existsSync } from 'std/fs/exists.ts';
import { Observable } from 'rxjs';
import { ApplyOutputs } from '../../base.service.ts';

export class LocalSecretService extends CrudResourceService<'secret', LocalCredentials> {
  get(id: string): Promise<ResourceOutputs['secret'] | undefined> {
    const file = path.join(this.credentials.directory, id);
    if (!existsSync(file)) {
      return Promise.resolve(undefined);
    }

    const contents = Deno.readTextFileSync(file);
    return Promise.resolve({
      id: id,
      data: contents,
    });
  }

  list(
    _filterOptions?: Partial<ResourceOutputs['secret']> | undefined,
    _pagingOptions?: Partial<PagingOptions> | undefined,
  ): Promise<PagingResponse<ResourceOutputs['secret']>> {
    const fileNames = Deno.readDirSync(this.credentials.directory);

    const secrets: ResourceOutputs['secret'][] = [];
    for (const file of fileNames) {
      if (file.isFile) {
        const filePath = path.join(this.credentials.directory, file.name);
        secrets.push({
          id: file.name,
          data: Deno.readTextFileSync(filePath),
        });
      }
    }

    return Promise.resolve({
      total: secrets.length,
      rows: secrets,
    });
  }

  create(inputs: ResourceInputs['secret']): Observable<ApplyOutputs<'secret'>> {
    return new Observable((subscriber) => {
      const startTime = Date.now();
      subscriber.next({
        status: {
          state: 'applying',
          message: 'Creating secret',
          startTime,
        },
      });

      let id = inputs.name.replaceAll('/', '--');
      if (inputs.namespace) {
        id = `${inputs.namespace}/${id}`;
      }

      const file = path.join(this.credentials.directory, id);
      Deno.mkdirSync(path.dirname(file), { recursive: true });
      Deno.writeTextFileSync(file, inputs.data);

      subscriber.next({
        status: {
          state: 'complete',
          startTime,
          endTime: Date.now(),
        },
        outputs: {
          id,
          data: inputs.data,
        },
        state: {
          id,
          data: inputs.data,
        },
      });

      subscriber.complete();
    });
  }

  update(_id: string, _inputs: ResourceInputs['secret']): Observable<ApplyOutputs<'secret'>> {
    throw new Error('Method not implemented.');
  }

  delete(id: string): Observable<ApplyOutputs<'secret'>> {
    return new Observable((subscriber) => {
      try {
        const startTime = Date.now();
        subscriber.next({
          status: {
            state: 'destroying',
            message: 'Destroying secret',
            startTime,
          },
        });

        const file = path.join(this.credentials.directory, id);
        if (!existsSync(file)) {
          throw new Error(`The ${id} secret does not exist`);
        }

        Deno.removeSync(file);

        subscriber.next({
          status: {
            state: 'complete',
            message: '',
            startTime,
            endTime: Date.now(),
          },
        });
        subscriber.complete();
      } catch (err) {
        subscriber.error(err);
      }
    });
  }
}
