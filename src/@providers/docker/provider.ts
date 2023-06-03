import { Provider } from '../provider.ts';
import { DockerCredentials, DockerCredentialsSchema } from './credentials.ts';
import { DockerDeploymentService } from './services/deployment.ts';
import { DockerNamespaceService } from './services/namespace.ts';
import { DockerServiceService } from './services/service.ts';

export default class DockerProvider extends Provider<DockerCredentials> {
  readonly type = 'docker';

  static readonly CredentialsSchema = DockerCredentialsSchema;

  readonly resources = {
    namespace: new DockerNamespaceService(this.credentials),
    deployment: new DockerDeploymentService(this.credentials),
    service: new DockerServiceService(this.credentials),
  };

  public testCredentials(): Promise<boolean> {
    return Promise.resolve(true);
  }
}
