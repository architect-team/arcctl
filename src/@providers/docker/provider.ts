import { Provider, ProviderResources } from '../provider.js';
import { DockerProvider as TerraformDockerProvider } from './.gen/providers/docker/provider/index.js';
import { DockerCredentials, DockerCredentialsSchema } from './credentials.js';
import { DockerDeploymentService } from './services/deployment.js';
import { DockerNamespaceService } from './services/namespace.js';
import { DockerServiceService } from './services/service.js';
import { Construct } from 'npm:constructs';

export default class DockerProvider extends Provider<DockerCredentials> {
  readonly type = 'docker';
  readonly terraform_version = '1.4.6';

  static readonly CredentialsSchema = DockerCredentialsSchema;

  readonly resources: ProviderResources<DockerCredentials> = {
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
