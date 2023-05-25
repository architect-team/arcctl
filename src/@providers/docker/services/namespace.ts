import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.js';
import { PagingOptions, PagingResponse } from '../../../utils/paging.js';
import { DeepPartial } from '../../../utils/types.js';
import { CrudResourceService } from '../../crud.service.js';
import { execa } from 'execa';

type DockerNetwork = {
  CreatedAt: string;
  Driver: string;
  ID: string;
  Name: string;
  Scope: string;
  Internal: string;
  IPv6: string;
};

export class DockerNamespaceService extends CrudResourceService<'namespace'> {
  async get(id: string): Promise<ResourceOutputs['namespace'] | undefined> {
    const results = await this.list();
    return results.rows.find((r) => r.id === id);
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['namespace']> | undefined,
    pagingOptions?: Partial<PagingOptions> | undefined,
  ): Promise<PagingResponse<ResourceOutputs['namespace']>> {
    const { stdout } = await execa('docker', [
      'network',
      'ls',
      '--format',
      'json',
    ]);
    const rawOutput: DockerNetwork[] = JSON.parse(
      `[${stdout.split('\n').join(',')}]`,
    );
    return {
      total: rawOutput.length,
      rows: rawOutput.map((r) => ({
        id: r.Name,
      })),
    };
  }

  async create(
    inputs: ResourceInputs['namespace'],
  ): Promise<ResourceOutputs['namespace']> {
    await execa('docker', ['network', 'create', inputs.name]);
    return {
      id: inputs.name,
    };
  }

  async update(
    inputs: ResourceInputs['namespace'],
  ): Promise<DeepPartial<ResourceOutputs['namespace']>> {
    throw new Error('Not yet implemented');
  }

  async delete(id: string): Promise<void> {
    await execa('docker', ['network', 'rm', id]);
  }
}
