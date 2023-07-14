import { Subscriber } from 'rxjs';
import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { exec } from '../../../utils/command.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { DeepPartial } from '../../../utils/types.ts';
import { CrudResourceService } from '../../crud.service.ts';
import { DockerCredentials } from '../credentials.ts';

export class DockerPushService extends CrudResourceService<'containerPush', DockerCredentials> {
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
    if (!inputs.registry && !inputs.namespace) {
      return {
        id: inputs.digest,
      };
    }

    const tagParts = [];
    if (inputs.registry) {
      tagParts.push(inputs.registry);
    }

    if (inputs.namespace) {
      tagParts.push(inputs.namespace.replaceAll('/', '-'));
    }

    tagParts.push(inputs.name.replaceAll('/', '-'));

    let tag = tagParts.join('/');
    if (inputs.tag) {
      tag += ':' + inputs.tag;
    }

    const { code } = await exec('docker', { args: ['tag', inputs.digest, tag] });
    if (code !== 0) {
      throw new Error(`Failed to create tag, ${tag}, from digest, ${inputs.digest}.`);
    }

    return {
      id: tag,
    };
  }

  update(
    subscriber: Subscriber<string>,
    id: string,
    inputs: DeepPartial<ResourceInputs['containerPush']>,
  ): Promise<ResourceOutputs['containerPush']> {
    let name = id;
    let namespace: string | undefined;
    if (name.includes('/')) {
      const parts = name.split('/');
      namespace = parts[0];
      name = parts[1];
    }

    return this.create(subscriber, {
      type: 'containerPush',
      account: this.accountName,
      registry: inputs.registry,
      namespace: inputs.namespace || namespace,
      name: inputs.name || name,
      digest: inputs.digest || id,
      tag: inputs.tag,
    });
  }

  delete(subscriber: Subscriber<string>, id: string): Promise<void> {
    subscriber.next('Nothing to delete');
    return Promise.resolve();
  }
}
