import { exec } from '../../utils/command.ts';
import { Provider } from '../provider.ts';
import { DockerHubCredentials, DockerHubCredentialsSchema } from './credentials.ts';
import { DockerHubContainerPushService } from './services/containerPush.ts';

export default class DockerHubProvider extends Provider<DockerHubCredentials> {
  readonly type = 'docker-hub';

  static readonly CredentialsSchema = DockerHubCredentialsSchema;

  readonly resources = {
    containerPush: new DockerHubContainerPushService(this.name, this.credentials, this.providerStore),
  };

  public async testCredentials(): Promise<boolean> {
    const { code } = await exec('docker', {
      args: ['login', '--username', this.credentials.username, '--password', this.credentials.password],
    });

    if (code !== 0) {
      return false;
    }

    return true;
  }
}
