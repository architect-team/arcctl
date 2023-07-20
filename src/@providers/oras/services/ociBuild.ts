import { Subscriber } from 'rxjs';
import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { exec } from '../../../utils/command.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { DeepPartial } from '../../../utils/types.ts';
import { CrudResourceService } from '../../crud.service.ts';
import { OrasCredentials } from '../credentials.ts';

export class OrasOciBuildService extends CrudResourceService<'ociBuild', OrasCredentials> {
  get(id: string): Promise<ResourceOutputs['ociBuild'] | undefined> {
    return Promise.resolve(undefined);
  }

  list(
    filterOptions?: Partial<ResourceOutputs['ociBuild']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['ociBuild']>> {
    return Promise.resolve({
      total: 0,
      rows: [],
    });
  }

  async create(
    subscriber: Subscriber<string>,
    inputs: ResourceInputs['ociBuild'],
  ): Promise<ResourceOutputs['ociBuild']> {
    const args = ['push', '--oci-layout', inputs.layoutDir];

    if (inputs.config) {
      args.push('--config', `${inputs.config.file}:${inputs.config.mediaType}`);
    }

    args.push(...inputs.files);

    const { code, stdout, stderr } = await exec('oras', { args });
    if (code !== 0) {
      throw new Error(stderr);
    }

    const match = stdout.match(/^Digest:\s(sha256:[a-f0-9]{64})$/m);
    if (!match) {
      throw new Error('Something went wrong gathering the image digest');
    }

    return {
      id: inputs.layoutDir + '@' + match[1],
    };
  }

  update(
    subscriber: Subscriber<string>,
    id: string,
    inputs: DeepPartial<ResourceInputs['ociBuild']>,
  ): Promise<ResourceOutputs['ociBuild']> {
    if (inputs.files && inputs.layoutDir) {
      return this.create(subscriber, {
        type: 'ociBuild',
        account: this.accountName,
        config: inputs.config?.file && inputs.config?.mediaType
          ? {
            file: inputs.config.file,
            mediaType: inputs.config.mediaType,
          }
          : undefined,
        files: inputs.files || [],
        layoutDir: inputs.layoutDir,
      });
    }

    throw new Error(`Cannot update ociBuild resources`);
  }

  delete(subscriber: Subscriber<string>, id: string): Promise<void> {
    return Promise.resolve();
  }
}
