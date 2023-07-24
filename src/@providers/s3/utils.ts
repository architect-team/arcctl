import AWS from 'aws-sdk';
import { S3Credentials } from './credentials.ts';

const S3 = AWS.S3;

export default class S3Utils {
  public static getS3Client(credentials: S3Credentials): AWS.S3 {
    return new S3({
      endpoint: credentials.endpoint,
      region: credentials.region,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
      },
    });
  }

  public static doesBucketExist(name: string, client: AWS.S3): Promise<boolean> {
    return client.headBucket({
      Bucket: name,
    }).promise().then(() => true).catch(() => false);
  }
}
