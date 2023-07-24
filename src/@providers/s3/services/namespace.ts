import { Subscriber } from 'rxjs';
import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { DeepPartial } from '../../../utils/types.ts';
import { CrudResourceService } from '../../crud.service.ts';
import { S3Credentials } from '../credentials.ts';
import S3Utils from '../utils.ts';

export class S3NamespaceService extends CrudResourceService<'namespace', S3Credentials> {
  async get(id: string): Promise<ResourceOutputs['namespace'] | undefined> {
    const client = S3Utils.getS3Client(this.credentials);
    const doesExist = S3Utils.doesBucketExist(id, client);
    if (!doesExist) {
      return undefined;
    }
    return {
      id,
    };
  }

  async list(
    _filterOptions?: Partial<ResourceOutputs['namespace']> | undefined,
    _pagingOptions?: Partial<PagingOptions> | undefined,
  ): Promise<PagingResponse<ResourceOutputs['namespace']>> {
    const client = S3Utils.getS3Client(this.credentials);

    const namespaces: ResourceOutputs['namespace'][] = [];

    const buckets = await client.listBuckets().promise();
    for (const bucket of buckets.Buckets || []) {
      namespaces.push({
        id: bucket.Name!,
      });
    }

    return Promise.resolve({
      total: namespaces.length,
      rows: namespaces,
    });
  }

  async create(
    _subscriber: Subscriber<string>,
    inputs: ResourceInputs['namespace'],
  ): Promise<ResourceOutputs['namespace']> {
    const client = S3Utils.getS3Client(this.credentials);
    await client.createBucket({
      Bucket: inputs.name,
    }).promise();

    return {
      id: inputs.name,
    };
  }

  async update(
    _subscriber: Subscriber<string>,
    id: string,
    inputs: DeepPartial<ResourceInputs['namespace']>,
  ): Promise<ResourceOutputs['namespace']> {
    // Do nothing for now
    return {
      id,
    };
  }

  async delete(_subscriber: Subscriber<string>, id: string): Promise<void> {
    const client = S3Utils.getS3Client(this.credentials);
    await client.deleteBucket({
      Bucket: id,
    }).promise();
  }
}
