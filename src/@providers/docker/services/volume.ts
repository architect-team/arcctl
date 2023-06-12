import { Subscriber } from 'rxjs';
import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { exec } from '../../../utils/command.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { DeepPartial } from '../../../utils/types.ts';
import { CrudResourceService } from '../../crud.service.ts';
import { DockerCredentials } from '../credentials.ts';

type DockerVolume = {
  Availability: string;
  Driver: string;
  Group: string;
  Labels: string;
  Links: string;
  Mountpoint: string;
  Name: string;
  Scope: string;
  Size: string;
  Status: string;
};

export class DockerVolumeService extends CrudResourceService<'volume', DockerCredentials> {
  async get(id: string): Promise<ResourceOutputs['volume'] | undefined> {
    const results = await this.list();
    return results.rows.find((r) => r.id === id);
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['volume']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['volume']>> {
    const { stdout } = await exec('docker', { args: ['volume', 'ls', '--format', 'json'] });
    const rows = stdout.includes('\n') ? stdout.split('\n').filter((row) => Boolean(row)) : [stdout];
    const rawOutput: DockerVolume[] = JSON.parse(`[${rows.join(',')}]`);
    return {
      total: rawOutput.length,
      rows: rawOutput.map((r) => ({
        id: r.Name,
      })),
    };
  }

  async create(subscriber: Subscriber<string>, inputs: ResourceInputs['volume']): Promise<ResourceOutputs['volume']> {
    await exec('docker', { args: ['volume', 'create', inputs.name] });
    return {
      id: inputs.name,
    };
  }

  update(
    subscriber: Subscriber<string>,
    id: string,
    inputs: DeepPartial<ResourceInputs['volume']>,
  ): Promise<ResourceOutputs['volume']> {
    subscriber.next('Volumes cannot be updated. No action was taken.');
    return Promise.resolve({ id });
  }

  async delete(_subscriber: Subscriber<string>, id: string): Promise<void> {
    await exec('docker', { args: ['volume', 'rm', id] });
  }
}
