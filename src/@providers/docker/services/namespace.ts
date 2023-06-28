import { Subscriber } from 'rxjs';
import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { exec } from '../../../utils/command.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { CrudResourceService } from '../../crud.service.ts';
import { DockerCredentials } from '../credentials.ts';
import { RequiresDocker } from '../helper.ts';

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

  @RequiresDocker()
  async list(
    _filterOptions?: Partial<ResourceOutputs['namespace']> | undefined,
    _pagingOptions?: Partial<PagingOptions> | undefined,
  ): Promise<PagingResponse<ResourceOutputs['namespace']>> {
    const { stdout } = await exec('docker', { args: ['network', 'ls', '--format', 'json'] });
    const rows = stdout.includes('\n') ? stdout.split('\n').filter((row) => Boolean(row)) : [stdout];
    const rawOutput: DockerNetwork[] = JSON.parse(`[${rows.join(',')}]`);
    return {
      total: rawOutput.length,
      rows: rawOutput.map((r) => ({
        id: r.Name,
      })),
    };
  }

  @RequiresDocker()
  async create(
    _subscriber: Subscriber<string>,
    inputs: ResourceInputs['namespace'],
  ): Promise<ResourceOutputs['namespace']> {
    await exec('docker', { args: ['network', 'create', inputs.name] });
    return {
      id: inputs.name,
    };
  }

  @RequiresDocker()
  async update(
    subscriber: Subscriber<string>,
    id: string,
    _inputs: ResourceInputs['namespace'],
  ): Promise<ResourceOutputs['namespace']> {
    subscriber.next('Not updatable. No action taken.');
    const res = await this.get(id);
    if (!res) {
      throw new Error(`No namespace with ID: ${id}`);
    }

    return res;
  }

  @RequiresDocker()
  async delete(_subscriber: Subscriber<string>, id: string): Promise<void> {
    await exec('docker', { args: ['network', 'rm', id] });
  }
}
