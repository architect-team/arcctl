import { Subscriber } from 'rxjs';
import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { exec } from '../../../utils/command.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { DeepPartial } from '../../../utils/types.ts';
import { CrudResourceService } from '../../crud.service.ts';
import { OrasCredentials } from '../credentials.ts';

export class OrasOciTagService extends CrudResourceService<'ociTag', OrasCredentials> {
  get(id: string): Promise<ResourceOutputs['ociTag'] | undefined> {
    return Promise.resolve(undefined);
  }

  list(
    filterOptions?: Partial<ResourceOutputs['ociTag']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['ociTag']>> {
    return Promise.resolve({
      total: 0,
      rows: [],
    });
  }

  async create(
    subscriber: Subscriber<string>,
    inputs: ResourceInputs['ociTag'],
  ): Promise<ResourceOutputs['ociTag']> {
    const { code, stderr } = await exec('oras', {
      args: ['copy', '--from-oci-layout', '--to-oci-layout', inputs.source, inputs.target],
    });

    if (code !== 0) {
      throw new Error(stderr);
    }

    return {
      id: inputs.target,
    };
  }

  update(
    subscriber: Subscriber<string>,
    id: string,
    inputs: DeepPartial<ResourceInputs['ociTag']>,
  ): Promise<ResourceOutputs['ociTag']> {
    if (inputs.source && inputs.target) {
      return this.create(subscriber, {
        type: 'ociTag',
        source: inputs.source,
        target: inputs.target,
        account: this.accountName,
      });
    }

    throw new Error('Need both a source and target to create a tag');
  }

  async delete(subscriber: Subscriber<string>, id: string): Promise<void> {
    return Promise.resolve();
  }
}
