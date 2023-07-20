import { Subscriber } from 'rxjs';
import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { exec } from '../../../utils/command.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { DeepPartial } from '../../../utils/types.ts';
import { CrudResourceService } from '../../crud.service.ts';
import { DockerHubCredentials } from '../credentials.ts';

export class DockerHubOciPushService extends CrudResourceService<'ociPush', DockerHubCredentials> {
  get(id: string): Promise<ResourceOutputs['ociPush'] | undefined> {
    return Promise.resolve(undefined);
  }

  list(
    filterOptions?: Partial<ResourceOutputs['ociPush']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['ociPush']>> {
    return Promise.resolve({
      total: 0,
      rows: [],
    });
  }

  async create(
    subscriber: Subscriber<string>,
    inputs: ResourceInputs['ociPush'],
  ): Promise<ResourceOutputs['ociPush']> {
    const { code: loginCode } = await exec('oras', {
      args: ['login', '-u', this.credentials.username, '-p', this.credentials.password],
    });
    if (loginCode !== 0) {
      throw new Error(`Failed to login to Docker Hub.`);
    }

    const { code: copyCode } = await exec('oras', {
      args: ['copy', '--from-oci-layout', inputs.source, inputs.target],
    });
    if (copyCode !== 0) {
      throw new Error('Failed to push image to ' + inputs.target);
    }

    await exec('oras', { args: ['logout'] });

    return {
      id: inputs.target,
    };
  }

  async update(
    subscriber: Subscriber<string>,
    id: string,
    inputs: DeepPartial<ResourceInputs['ociPush']>,
  ): Promise<ResourceOutputs['ociPush']> {
    return this.create(subscriber, {
      type: 'containerPush',
      account: this.accountName,
      image: inputs.image || id,
    });
  }

  async delete(subscriber: Subscriber<string>, id: string): Promise<void> {
    return Promise.resolve();
  }
}
