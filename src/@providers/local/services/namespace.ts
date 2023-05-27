import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.js';
import { PagingOptions, PagingResponse } from '../../../utils/paging.js';
import { DeepPartial } from '../../../utils/types.js';
import { CrudResourceService } from '../../crud.service.js';
import { LocalCredentials } from '../credentials.js';
import fs from 'fs';
import path from 'path';

export class LocalNamespaceService extends CrudResourceService<'namespace'> {
  constructor(private credentials: LocalCredentials) {
    super();
  }

  async get(id: string): Promise<ResourceOutputs['namespace'] | undefined> {
    const file = path.join(this.credentials.directory, id);
    const stat = fs.lstatSync(file);

    if (!stat.isDirectory()) {
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
    const fileNames = fs.readdirSync(this.credentials.directory, {
      withFileTypes: true,
    });

    const namespaces: ResourceOutputs['namespace'][] = [];
    for (const file of fileNames) {
      if (file.isDirectory()) {
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

  async create(
    inputs: ResourceInputs['namespace'],
  ): Promise<ResourceOutputs['namespace']> {
    const namespace = path.join(this.credentials.directory, inputs.name);
    fs.mkdirSync(namespace);
    return {
      id: inputs.name,
    };
  }

  update(
    inputs: ResourceInputs['namespace'],
  ): Promise<DeepPartial<ResourceOutputs['namespace']>> {
    throw new Error('Method not implemented.');
  }

  async delete(id: string): Promise<void> {
    const namespace = path.join(this.credentials.directory, id);
    fs.rmSync(namespace, { recursive: true });
  }
}
