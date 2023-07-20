import { Subscriber } from 'rxjs';
import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { ImageRepository } from '../../../oci/index.ts';
import { exec } from '../../../utils/command.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { DeepPartial } from '../../../utils/types.ts';
import { CrudResourceService } from '../../crud.service.ts';
import { DockerHubCredentials } from '../credentials.ts';

export class DockerHubContainerPushService extends CrudResourceService<'containerPush', DockerHubCredentials> {
  get(id: string): Promise<ResourceOutputs['containerPush'] | undefined> {
    return Promise.resolve(undefined);
  }

  list(
    filterOptions?: Partial<ResourceOutputs['containerPush']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['containerPush']>> {
    return Promise.resolve({
      total: 0,
      rows: [],
    });
  }

  async create(
    subscriber: Subscriber<string>,
    inputs: ResourceInputs['containerPush'],
  ): Promise<ResourceOutputs['containerPush']> {
    const { code: loginCode } = await exec('docker', {
      args: ['login', '-u', this.credentials.username, '-p', this.credentials.password],
    });
    if (loginCode !== 0) {
      throw new Error(`Failed to login to Docker Hub.`);
    }

    const image = new ImageRepository(inputs.image);
    if (image.registry) {
      const source = image.toString();
      delete image.registry;
      const target = image.toString();

      const { code: tagCode } = await exec('docker', { args: ['tag', source, target] });
      if (tagCode !== 0) {
        throw new Error(`Something went wrong tagging the image for DockerHub: tag ${source} ${target}`);
      }
    }

    const { code: pushCode } = await exec('docker', { args: ['push', image.toString()] });
    if (pushCode !== 0) {
      throw new Error(`Failed to push image: ${image.toString()}`);
    }

    await exec('docker', { args: ['logout'] });

    subscriber.next(image.toString());
    return {
      id: image.toString(),
    };
  }

  async update(
    subscriber: Subscriber<string>,
    id: string,
    inputs: DeepPartial<ResourceInputs['containerPush']>,
  ): Promise<ResourceOutputs['containerPush']> {
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
