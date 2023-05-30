import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { DeepPartial } from '../../../utils/types.ts';
import { CrudResourceService } from '../../crud.service.ts';
import { LocalCredentials } from '../credentials.ts';
import fs from 'fs';
import path from 'path';

export class LocalSecretService extends CrudResourceService<'secret'> {
  constructor(private credentials: LocalCredentials) {
    super();
  }

  async get(id: string): Promise<ResourceOutputs['secret'] | undefined> {
    const file = path.join(this.credentials.directory, id);
    if (!fs.existsSync(file)) {
      return undefined;
    }

    const contents = fs.readFileSync(file, 'utf8');
    return {
      id: id,
      data: contents,
    };
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['secret']> | undefined,
    pagingOptions?: Partial<PagingOptions> | undefined,
  ): Promise<PagingResponse<ResourceOutputs['secret']>> {
    const fileNames = fs.readdirSync(this.credentials.directory, {
      withFileTypes: true,
    });

    const secrets: ResourceOutputs['secret'][] = [];
    for (const file of fileNames) {
      if (file.isFile()) {
        const filePath = path.join(this.credentials.directory, file.name);
        secrets.push({
          id: file.name,
          data: fs.readFileSync(filePath, 'utf8'),
        });
      }
    }

    return {
      total: secrets.length,
      rows: secrets,
    };
  }

  async create(inputs: ResourceInputs['secret']): Promise<ResourceOutputs['secret']> {
    let id = inputs.name.replaceAll('/', '--');
    if (inputs.namespace) {
      id = `${inputs.namespace}/${id}`;
    }

    const file = path.join(this.credentials.directory, id);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, inputs.data);

    return {
      id,
      data: inputs.data,
    };
  }

  update(inputs: ResourceInputs['secret']): Promise<DeepPartial<ResourceOutputs['secret']>> {
    throw new Error('Method not implemented.');
  }

  async delete(id: string): Promise<void> {
    const file = path.join(this.credentials.directory, id);
    if (!fs.existsSync(file)) {
      throw new Error(`The ${id} secret does not exist`);
    }

    fs.rmSync(file);
  }
}
