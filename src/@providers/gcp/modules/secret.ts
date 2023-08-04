import { Construct } from 'constructs';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule, ResourceModuleOptions } from '../../module.ts';
import { SecretManagerSecretVersion } from '../.gen/providers/google/secret-manager-secret-version/index.ts';
import { SecretManagerSecret } from '../.gen/providers/google/secret-manager-secret/index.ts';
import { GoogleCloudCredentials } from '../credentials.ts';
import GcpUtils from '../utils.ts';

export class GoogleCloudSecretModule extends ResourceModule<'secret', GoogleCloudCredentials> {
  private secret: SecretManagerSecret;
  private secretVersion: SecretManagerSecretVersion;
  outputs: ResourceOutputs['secret'];

  constructor(scope: Construct, options: ResourceModuleOptions<'secret', GoogleCloudCredentials>) {
    super(scope, options);

    GcpUtils.configureProvider(this);

    let secret_name = (options.inputs?.name || 'unknown').replaceAll('/', '-');
    if (options.inputs?.namespace) {
      secret_name = options.inputs.namespace + '-' + secret_name;
    }

    this.secret = new SecretManagerSecret(this, 'secret', {
      secretId: secret_name,
      replication: {
        automatic: true,
      },
    });

    this.secretVersion = new SecretManagerSecretVersion(this, 'version', {
      secret: this.secret.id,
      secretData: options.inputs?.data || '',
    });

    this.outputs = {
      id: this.secret.id,
      data: this.secretVersion.secretData,
    };
  }

  genImports(resourceId: string, credentials?: GoogleCloudCredentials | undefined): Promise<Record<string, string>> {
    return Promise.resolve({
      [this.getResourceRef(this.secret)]: resourceId,
    });
  }

  getDisplayNames(): Record<string, string> {
    return {
      [this.getResourceRef(this.secret)]: 'Secret',
    };
  }
}
