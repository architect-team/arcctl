import { Provider } from '../provider.ts';
import { S3Credentials, S3CredentialsSchema } from './credentials.ts';
import { S3NamespaceService } from './services/namespace.ts';
import { S3SecretService } from './services/secret.ts';
import S3Utils from './utils.ts';

export default class S3Provider extends Provider<S3Credentials> {
  readonly type = 's3';

  static readonly CredentialsSchema = S3CredentialsSchema;

  resources = {
    namespace: new S3NamespaceService(this.name, this.credentials, this.providerStore),
    secret: new S3SecretService(this.name, this.credentials, this.providerStore),
  };

  public testCredentials(): Promise<boolean> {
    const client = S3Utils.getS3Client(this.credentials);
    return client.listBuckets().promise().then(() => true).catch((err) => {
      console.log('****S3 provider error');
      console.log(err);
      return false;
    });
  }
}
