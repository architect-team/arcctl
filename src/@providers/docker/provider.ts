import { Provider } from '../provider.ts';
import { DockerProvider as TerraformDockerProvider } from './.gen/providers/docker/provider/index.ts';
import { DockerCredentials, DockerCredentialsSchema } from './credentials.ts';
import { DockerDeploymentService } from './services/deployment.ts';
import { DockerNamespaceService } from './services/namespace.ts';
import { DockerServiceService } from './services/service.ts';
import { Construct } from 'constructs';

export default class DockerProvider extends Provider<DockerCredentials> {
  readonly type = 'docker';
  readonly terraform_version = '1.4.6';

  static readonly CredentialsSchema = DockerCredentialsSchema;

  readonly resources = {
    namespace: new DockerNamespaceService(),
    deployment: new DockerDeploymentService(),
    service: new DockerServiceService(),
  };

  public async testCredentials(): Promise<boolean> {
    return true;
  }

  public configureTerraformProviders(scope: Construct): void {
    new TerraformDockerProvider(scope, this.name, this.credentials);
  }
}
