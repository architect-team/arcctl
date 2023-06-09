import { exec } from '../../utils/command.ts';
import { Provider } from '../provider.ts';
import { DockerCredentials, DockerCredentialsSchema } from './credentials.ts';
import { DockerDatabaseService } from './services/database.ts';
import { DockerDeploymentService } from './services/deployment.ts';
import { DockerLoadBalancerTypeService } from './services/load-balancer-type.ts';
import { DockerLoadBalancerService } from './services/load-balancer.ts';
import { DockerNamespaceService } from './services/namespace.ts';
import { DockerTaskService } from './services/task.ts';
import { DockerVolumeService } from './services/volume.ts';

type DockerInfo = {
  ID: string;
  Containers: number;
  ContainersRunning: number;
  ContainersPaused: number;
  ContainersStopped: number;
  Images: number;
  Driver: string;
  OSType: string;
  Architecture: string;
  NCPU: number;
  MemTotal: number;
  DockerRootDir: string;
  ServerVersion: string;
};

export default class DockerProvider extends Provider<DockerCredentials> {
  readonly type = 'docker';

  static readonly CredentialsSchema = DockerCredentialsSchema;

  readonly resources = {
    namespace: new DockerNamespaceService(this.name, this.credentials, this.providerStore),
    deployment: new DockerDeploymentService(this.name, this.credentials, this.providerStore),
    task: new DockerTaskService(this.name, this.credentials, this.providerStore),
    volume: new DockerVolumeService(this.name, this.credentials, this.providerStore),
    loadBalancer: new DockerLoadBalancerService(this.name, this.credentials, this.providerStore),
    loadBalancerType: new DockerLoadBalancerTypeService(this.name, this.credentials, this.providerStore),
    database: new DockerDatabaseService(this.name, this.credentials, this.providerStore),
  };

  public async testCredentials(): Promise<boolean> {
    const { stdout } = await exec('docker', { args: ['info'] });
    const info = JSON.parse(stdout) as DockerInfo;
    return Boolean(info.ServerVersion);
  }
}
