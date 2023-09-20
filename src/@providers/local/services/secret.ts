import { Subscriber } from 'rxjs';
import * as path from 'std/path/mod.ts';
import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { pathExistsSync } from '../../../utils/filesystem.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { DeepPartial } from '../../../utils/types.ts';
import { CrudResourceService } from '../../crud.service.ts';
import { LocalCredentials } from '../credentials.ts';

export class LocalSecretService extends CrudResourceService<'secret', LocalCredentials> {
  get(id: string): Promise<ResourceOutputs['secret'] | undefined> {
    id = id.replaceAll('/', '--');
    const file = path.join(this.credentials.directory, id);
    if (!pathExistsSync(file)) {
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

  create(_subscriber: Subscriber<string>, inputs: ResourceInputs['secret']): Promise<ResourceOutputs['secret']> {
    let id = inputs.name.replaceAll('/', '--');
    if (inputs.namespace) {
      id = `${inputs.namespace}--${id}`;
    }

    const file = path.join(this.credentials.directory, id);
    Deno.mkdirSync(path.dirname(file), { recursive: true });
    Deno.writeTextFileSync(file, inputs.data);
    console.log(`Created secret ${file}`);

    return Promise.resolve({
      id,
      data: inputs.data,
    });
  }

  update(
    subscriber: Subscriber<string>,
    id: string,
    inputs: DeepPartial<ResourceInputs['secret']>,
  ): Promise<ResourceOutputs['secret']> {
    let originalNamespace = '';
    let originalName = '';
    if (/\//.test(id)) {
      [originalNamespace, originalName] = id.split('/');
    } else {
      originalName = id;
    }

    const newNamespace = inputs.namespace || originalNamespace;
    const newName = inputs.name ? inputs.name.replaceAll('/', '--') : originalName;
    const newId = newNamespace ? `${newNamespace}--${newName}` : newName;

    const originalFile = path.join(this.credentials.directory, id);
    const newFile = path.join(this.credentials.directory, newId);
    Deno.mkdirSync(path.dirname(newFile), { recursive: true });
    console.log(`Created secret ${newFile}`);
    if (inputs.data) {
      Deno.removeSync(originalFile);
      Deno.writeTextFileSync(newFile, inputs.data);

      return Promise.resolve({
        id: newId,
        data: inputs.data,
      });
    } else {
      Deno.renameSync(originalFile, newFile);

      const oldData = Deno.readTextFileSync(newFile);
      return Promise.resolve({
        id: newId,
        data: oldData,
      });
    }
  }

  delete(_subscriber: Subscriber<string>, id: string): Promise<void> {
    id = id.replaceAll('/', '--');
    const file = path.join(this.credentials.directory, id);
    try {
      Deno.removeSync(file);
      return Promise.resolve();
    } catch (err) {
      if (err instanceof Deno.errors.NotFound) {
        return Promise.resolve();
      }

      return Promise.reject(err);
    }
  }
}
