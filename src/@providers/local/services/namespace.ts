import { Subscriber } from 'rxjs';
import * as path from 'std/path/mod.ts';
import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { DeepPartial } from '../../../utils/types.ts';
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

  create(_subscriber: Subscriber<string>, inputs: ResourceInputs['namespace']): Promise<ResourceOutputs['namespace']> {
    const namespace = path.join(this.credentials.directory, inputs.name);
    Deno.mkdirSync(namespace);
    return Promise.resolve({
      id: inputs.name,
    });
  }

  update(
    subscriber: Subscriber<string>,
    id: string,
    inputs: DeepPartial<ResourceInputs['namespace']>,
  ): Promise<ResourceOutputs['namespace']> {
    if (inputs.name && inputs.name !== id) {
      Deno.renameSync(path.join(this.credentials.directory, id), path.join(this.credentials.directory, inputs.name));
      return Promise.resolve({
        id: inputs.name,
      });
    }

    subscriber.next('No changes detected');

    return Promise.resolve({
      id,
    });
  }

  delete(_subscriber: Subscriber<string>, id: string): Promise<void> {
    const namespace = path.join(this.credentials.directory, id);
    Deno.removeSync(namespace, { recursive: true });
    return Promise.resolve();
  }
}
