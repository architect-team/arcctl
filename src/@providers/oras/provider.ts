import { exec } from '../../utils/command.ts';
import { Provider } from '../provider.ts';
import { OrasCredentials, OrasCredentialsSchema } from './credentials.ts';
import { OrasOciBuildService } from './services/ociBuild.ts';
import { OrasOciTagService } from './services/ociTag.ts';

export default class OrasProvider extends Provider<OrasCredentials> {
  readonly type = 'oras';

  static readonly CredentialsSchema = OrasCredentialsSchema;

  readonly resources = {
    ociBuild: new OrasOciBuildService(this.name, this.credentials, this.providerStore),
    ociTag: new OrasOciTagService(this.name, this.credentials, this.providerStore),
  };

  public async testCredentials(): Promise<boolean> {
    const { code } = await exec('oras', { args: ['version'] });
    return code === 0;
  }
}
