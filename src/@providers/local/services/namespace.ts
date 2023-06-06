import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { DeepPartial } from '../../../utils/types.ts';
import { CrudResourceService } from '../../crud.service.ts';
import { LocalCredentials } from '../credentials.ts';
import * as path from 'std/path/mod.ts';

export class LocalNamespaceService extends CrudResourceService<'namespace'> {
  constructor(private credentials: LocalCredentials) {
    super();
  }

  async get(id: string): Promise<ResourceOutputs['namespace'] | undefined> {
    const file = path.join(this.credentials.directory, id);
    const stat = Deno.lstatSync(file);

    if (!stat.isDirectory) {
      return undefined;
    }

    return {
      id: id,
    };
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['namespace']> | undefined,
    pagingOptions?: Partial<PagingOptions> | undefined,
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

    return {
      total: namespaces.length,
      rows: namespaces,
    };
  }

  async create(inputs: ResourceInputs['namespace']): Promise<ResourceOutputs['namespace']> {
    const namespace = path.join(this.credentials.directory, inputs.name);
    Deno.mkdirSync(namespace);
    return {
      id: inputs.name,
    };
  }

  update(inputs: ResourceInputs['namespace']): Promise<DeepPartial<ResourceOutputs['namespace']>> {
    throw new Error('Method not implemented.');
  }

  async delete(id: string): Promise<void> {
    const namespace = path.join(this.credentials.directory, id);
    Deno.removeSync(namespace, { recursive: true });
  }
}
