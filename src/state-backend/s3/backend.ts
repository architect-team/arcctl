import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { StateBackend } from '../backend.ts';
import { S3Credentials } from './credentials.ts';

export default class S3StateBackend<T> extends StateBackend<T, S3Credentials> {
  private get s3(): S3Client {
    return new S3Client({
      region: this.credentials.region,
      endpoint: this.credentials.endpoint,
      credentials: {
        accessKeyId: this.credentials.accessKeyId,
        secretAccessKey: this.credentials.secretAccessKey,
      },
    });
  }

  testCredentials(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async getAll(): Promise<T[]> {
    const command = new GetObjectCommand({
      Bucket: this.credentials.bucket,
      Key: `architect-${this.name}-state.json`,
    });

    const data = await this.s3.send(command);

    if (!data.Body) {
      return [];
    }

    return JSON.parse(data.Body.toString());
  }

  async saveAll(records: T[]): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.credentials.bucket,
      Key: `architect-${this.name}-state.json`,
      Body: JSON.stringify(records),
    });

    await this.s3.send(command);
  }
}
