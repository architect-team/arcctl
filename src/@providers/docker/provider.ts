import { Provider } from '../provider.ts';
import { DockerCredentials, DockerCredentialsSchema } from './credentials.ts';
import { DockerDeploymentService } from './services/deployment.ts';
import { DockerNamespaceService } from './services/namespace.ts';

export default class DockerProvider extends Provider<DockerCredentials> {
  readonly type = 'docker';

  static readonly CredentialsSchema = DockerCredentialsSchema;

  readonly resources = {
    namespace: new DockerNamespaceService(this.name, this.credentials, this.providerStore),
    deployment: new DockerDeploymentService(this.name, this.credentials, this.providerStore),
  };

  public testCredentials(): Promise<boolean> {
    return Promise.resolve(true);
  }
}
