import { Subscriber } from 'rxjs';
import * as path from 'std/path/mod.ts';
import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { exec } from '../../../utils/command.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { DeepPartial } from '../../../utils/types.ts';
import { CrudResourceService } from '../../crud.service.ts';
import { DockerCredentials } from '../credentials.ts';

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

    return {
      id: stdout.replace(/^\s+|\s+$/g, ''),
    };
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
    subscriber.next('Nothing to delete');
    return Promise.resolve();
  }
}
