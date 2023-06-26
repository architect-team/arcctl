import { Subscriber } from 'rxjs';
import * as path from 'std/path/mod.ts';
import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { exec } from '../../../utils/command.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { DeepPartial } from '../../../utils/types.ts';
import { CrudResourceService } from '../../crud.service.ts';
import { DockerCredentials } from '../credentials.ts';

export class DockerBuildService extends CrudResourceService<'dockerBuild', DockerCredentials> {
  get(id: string): Promise<ResourceOutputs['dockerBuild'] | undefined> {
    return Promise.resolve(undefined);
  }

  list(
    filterOptions?: Partial<ResourceOutputs['dockerBuild']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['dockerBuild']>> {
    return Promise.resolve({
      total: 0,
      rows: [],
    });
  }

  async create(
    subscriber: Subscriber<string>,
    inputs: ResourceInputs['dockerBuild'],
  ): Promise<ResourceOutputs['dockerBuild']> {
    const args = ['build', '--quiet'];

    if (inputs.dockerfile) {
      args.push('-f', inputs.dockerfile);
    }

    const context = path.isAbsolute(inputs.context)
      ? inputs.context
      : path.join(path.dirname(inputs.component_source), inputs.context);
    args.push('./');

    const { code, stdout, stderr } = await exec('docker', {
      args,
      cwd: context,
    });
    if (code !== 0) {
      throw new Error(stderr || 'Build failed');
    }

    return {
      id: stdout.replace(/^\s+|\s+$/g, ''),
    };
  }

  update(
    subscriber: Subscriber<string>,
    id: string,
    inputs: DeepPartial<ResourceInputs['dockerBuild']>,
  ): Promise<ResourceOutputs['dockerBuild']> {
    if (inputs.context) {
      return this.create(subscriber, inputs as ResourceInputs['dockerBuild']);
    }

    throw new Error(`Cannot update dockerBuild resources`);
  }

  delete(subscriber: Subscriber<string>, id: string): Promise<void> {
    subscriber.next('Nothing to delete');
    return Promise.resolve();
  }
}
