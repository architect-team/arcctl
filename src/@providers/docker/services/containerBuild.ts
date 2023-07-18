import { lastValueFrom, Subscriber } from 'rxjs';
import * as path from 'std/path/mod.ts';
import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { exec } from '../../../utils/command.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { DeepPartial } from '../../../utils/types.ts';
import { CrudResourceService } from '../../crud.service.ts';
import { DockerCredentials } from '../credentials.ts';
import { DockerContainerTagService } from './containerTag.ts';

export class DockerBuildService extends CrudResourceService<'containerBuild', DockerCredentials> {
  get(id: string): Promise<ResourceOutputs['containerBuild'] | undefined> {
    return Promise.resolve(undefined);
  }

  list(
    filterOptions?: Partial<ResourceOutputs['containerBuild']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['containerBuild']>> {
    return Promise.resolve({
      total: 0,
      rows: [],
    });
  }

  async create(
    subscriber: Subscriber<string>,
    inputs: ResourceInputs['containerBuild'],
  ): Promise<ResourceOutputs['containerBuild']> {
    const args = ['build', '--quiet'];

    if (inputs.dockerfile) {
      args.push('-f', inputs.dockerfile);
    }

    const context = path.isAbsolute(inputs.context) ? inputs.context : path.join(
      Deno.lstatSync(inputs.component_source).isFile ? path.dirname(inputs.component_source) : inputs.component_source,
      inputs.context,
    );
    args.push('./');

    const { code, stdout, stderr } = await exec('docker', {
      args,
      cwd: context,
    });

    if (code !== 0) {
      throw new Error(stderr || 'Build failed');
    }

    const digest = stdout.replace(/\n+$/, '').replace(/^\s+|\s+$/g, '');

    if (inputs.push) {
      const parts = [inputs.push.name];
      if (inputs.push.namespace) {
        parts.unshift(inputs.push.namespace);
      }

      let tag = inputs.push.name;
      if (inputs.push.namespace) {
        tag = `${inputs.push.namespace}/${tag}`;
      }

      if (inputs.push.tag) {
        tag = `${tag}:${inputs.push.tag}`;
      }

      const tagService = new DockerContainerTagService(this.accountName, this.credentials, this.providerStore);
      const { id: image } = await tagService.create(subscriber, {
        type: 'containerTag',
        account: this.accountName,
        source: digest,
        target: tag,
      });

      const pushService = this.providerStore.getWritableService(inputs.push.account, 'containerPush');
      const { outputs } = await lastValueFrom(pushService.apply({
        type: 'containerPush',
        account: inputs.push.account,
        image,
      }, {
        id: '',
        providerStore: this.providerStore,
      }));

      if (!outputs) {
        throw new Error('Failed to push image');
      }

      subscriber.next(outputs.id!);
      return {
        id: outputs!.id,
      };
    } else {
      subscriber.next(digest);
      return {
        id: digest,
      };
    }
  }

  update(
    subscriber: Subscriber<string>,
    id: string,
    inputs: DeepPartial<ResourceInputs['containerBuild']>,
  ): Promise<ResourceOutputs['containerBuild']> {
    if (inputs.context) {
      return this.create(subscriber, inputs as ResourceInputs['containerBuild']);
    }

    throw new Error(`Cannot update containerBuild resources`);
  }

  delete(subscriber: Subscriber<string>, id: string): Promise<void> {
    return Promise.resolve();
  }
}
