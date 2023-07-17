import { Subscriber } from 'rxjs';
import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { DeepPartial } from '../../../utils/types.ts';
import { CrudResourceService } from '../../crud.service.ts';
import { S3Credentials } from '../credentials.ts';
import S3Utils from '../utils.ts';

const ARCCTL_SECRET_TYPE = 'arcctl-secret';

export class S3SecretService extends CrudResourceService<'secret', S3Credentials> {
  async get(id: string): Promise<ResourceOutputs['secret'] | undefined> {
    const client = S3Utils.getS3Client(this.credentials);
    const idParts = id.split('--');
    if (idParts.length < 2) {
      throw new Error(`The secret name for ${id} is invalid`);
    }
    const namespace = idParts.shift();
    const name = idParts.join('--');
    const object = await client.getObject({
      Bucket: namespace!,
      Key: name,
    }).promise();
    if (!object.Body) {
      throw new Error(`The ${id} secret does not exist`);
    }

    return Promise.resolve({
      id: id,
      data: object.Body.toString(),
    });
  }

  async list(
    _filterOptions?: Partial<ResourceOutputs['secret']> | undefined,
    _pagingOptions?: Partial<PagingOptions> | undefined,
  ): Promise<PagingResponse<ResourceOutputs['secret']>> {
    const client = S3Utils.getS3Client(this.credentials);
    client.bucket;

    const secrets: ResourceOutputs['secret'][] = [];

    const buckets = await client.listBuckets().promise();
    for (const bucket of buckets.Buckets || []) {
      const objects = await client.listObjects({
        Bucket: bucket.Name!,
      }).promise();
      for (const object of objects.Contents || []) {
        if (object.Key) {
          const objectMetadata = await client.headObject({
            Bucket: bucket.Name!,
            Key: object.Key,
          }).promise();
          if (objectMetadata.Metadata?.type !== ARCCTL_SECRET_TYPE) {
            continue;
          }
          const data = await client.getObject({
            Bucket: bucket.Name!,
            Key: object.Key,
          }).promise();
          secrets.push({
            id: `${bucket.Name}--${object.Key}`,
            data: data.Body?.toString() || '',
          });
        }
      }
    }

    return Promise.resolve({
      total: secrets.length,
      rows: secrets,
    });
  }

  async create(_subscriber: Subscriber<string>, inputs: ResourceInputs['secret']): Promise<ResourceOutputs['secret']> {
    const client = S3Utils.getS3Client(this.credentials);

    await client.putObject({
      Bucket: inputs.namespace!,
      Key: inputs.name,
      Body: inputs.data,
      Metadata: {
        'type': ARCCTL_SECRET_TYPE,
      },
    }).promise();
    let id = inputs.name.replaceAll('/', '--');
    if (inputs.namespace) {
      id = `${inputs.namespace}--${id}`;
    }

    return Promise.resolve({
      id,
      data: inputs.data,
    });
  }

  async update(
    _subscriber: Subscriber<string>,
    id: string,
    inputs: DeepPartial<ResourceInputs['secret']>,
  ): Promise<ResourceOutputs['secret']> {
    const client = S3Utils.getS3Client(this.credentials);
    const idParts = id.split('--');
    if (idParts.length < 2) {
      throw new Error(`The secret name for ${id} is invalid`);
    }
    const namespace = idParts.shift();
    const name = idParts.join('--');
    await client.putObject({
      Bucket: namespace!,
      Key: name,
      Body: inputs.data,
    }).promise();

    return Promise.resolve({
      id,
      data: inputs.data!,
    });
  }

  async delete(_subscriber: Subscriber<string>, id: string): Promise<void> {
    const client = S3Utils.getS3Client(this.credentials);
    const idParts = id.split('--');
    if (idParts.length < 2) {
      throw new Error(`The secret name for ${id} is invalid`);
    }
    const namespace = idParts.shift();
    const name = idParts.join('--');

    await client.deleteObject({
      Bucket: namespace!,
      Key: name,
    }).promise();
    return;
  }
}
