import { RequiresDocker } from '../../docker/helper.ts';
import { exec } from '../../utils/command.ts';
import { Provider } from '../provider.ts';
import { DockerCredentials, DockerCredentialsSchema } from './credentials.ts';
import { DockerBuildService } from './services/build.ts';
import { DockerDeploymentService } from './services/deployment.ts';
import { DockerNamespaceService } from './services/namespace.ts';
import { DockerTaskService } from './services/task.ts';
import { DockerVolumeService } from './services/volume.ts';
import { DockerInfo } from './types.ts';

export default class DockerProvider extends Provider<DockerCredentials> {
  readonly type = 'docker';

  static readonly CredentialsSchema = DockerCredentialsSchema;

  readonly resources = {
    namespace: new DockerNamespaceService(this.name, this.credentials, this.providerStore),
    deployment: new DockerDeploymentService(this.name, this.credentials, this.providerStore),
    task: new DockerTaskService(this.name, this.credentials, this.providerStore),
    volume: new DockerVolumeService(this.name, this.credentials, this.providerStore),
    dockerBuild: new DockerBuildService(this.name, this.credentials, this.providerStore),
  };

  @RequiresDocker()
  public async testCredentials(): Promise<boolean> {
    const { stdout } = await exec('docker', { args: ['info', '--format=json'] });
    const info = JSON.parse(stdout) as DockerInfo;
    return Boolean(info.ServerVersion);
  }
}
