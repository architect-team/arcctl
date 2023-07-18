import { Subscriber } from 'rxjs';
import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { exec } from '../../../utils/command.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { DeepPartial } from '../../../utils/types.ts';
import { CrudResourceService } from '../../crud.service.ts';
import { DockerCredentials } from '../credentials.ts';

export class DockerContainerTagService extends CrudResourceService<'containerTag', DockerCredentials> {
  get(id: string): Promise<ResourceOutputs['containerTag'] | undefined> {
    return Promise.resolve(undefined);
  }

  list(
    filterOptions?: Partial<ResourceOutputs['containerTag']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['containerTag']>> {
    return Promise.resolve({
      total: 0,
      rows: [],
    });
  }

  async create(
    subscriber: Subscriber<string>,
    inputs: ResourceInputs['containerTag'],
  ): Promise<ResourceOutputs['containerTag']> {
    const { code, stderr } = await exec('docker', {
      args: ['tag', inputs.source, inputs.target],
    });

    if (code !== 0) {
      throw new Error(stderr || 'Failed to create tag, ' + inputs.target + ', from ' + inputs.source);
    }

    return {
      id: inputs.target,
    };
  }

  update(
    subscriber: Subscriber<string>,
    id: string,
    inputs: DeepPartial<ResourceInputs['containerTag']>,
  ): Promise<ResourceOutputs['containerTag']> {
    if (inputs.source && inputs.target) {
      return this.create(subscriber, {
        type: 'containerTag',
        source: inputs.source,
        target: inputs.target,
        account: this.accountName,
      });
    }

    throw new Error('Need both a source and target to create a tag');
  }

  async delete(subscriber: Subscriber<string>, id: string): Promise<void> {
    await exec('docker', { args: ['rmi', id] });
  }
}
