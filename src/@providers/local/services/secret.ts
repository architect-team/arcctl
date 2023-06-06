import { existsSync } from 'std/fs/exists.ts';
import * as path from 'std/path/mod.ts';
import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { DeepPartial } from '../../../utils/types.ts';
import { CrudResourceService } from '../../crud.service.ts';
import { LocalCredentials } from '../credentials.ts';

export class LocalSecretService extends CrudResourceService<'secret'> {
  constructor(private credentials: LocalCredentials) {
    super();
  }

  // deno-lint-ignore require-await
  async get(id: string): Promise<ResourceOutputs['secret'] | undefined> {
    const file = path.join(this.credentials.directory, id);
    if (!existsSync(file)) {
      return undefined;
    }

    const contents = Deno.readTextFileSync(file);
    return {
      id: id,
      data: contents,
    };
  }

  // deno-lint-ignore require-await
  async list(
    filterOptions?: Partial<ResourceOutputs['secret']> | undefined,
    pagingOptions?: Partial<PagingOptions> | undefined,
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

    return {
      total: secrets.length,
      rows: secrets,
    };
  }

  // deno-lint-ignore require-await
  async create(inputs: ResourceInputs['secret']): Promise<ResourceOutputs['secret']> {
    let id = inputs.name.replaceAll('/', '--');
    if (inputs.namespace) {
      id = `${inputs.namespace}/${id}`;
    }

    const file = path.join(this.credentials.directory, id);
    Deno.mkdirSync(path.dirname(file), { recursive: true });
    Deno.writeTextFileSync(file, inputs.data);

    return {
      id,
      data: inputs.data,
    };
  }

  update(inputs: ResourceInputs['secret']): Promise<DeepPartial<ResourceOutputs['secret']>> {
    throw new Error('Method not implemented.');
  }

  // deno-lint-ignore require-await
  async delete(id: string): Promise<void> {
    const file = path.join(this.credentials.directory, id);
    if (!existsSync(file)) {
      throw new Error(`The ${id} secret does not exist`);
    }

    Deno.removeSync(file);
  }
}
