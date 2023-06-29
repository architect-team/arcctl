import { Provider } from '../provider.ts';
import { KubernetesCredentials, KubernetesCredentialsSchema } from './credentials.ts';
import { KubernetesDeploymentService } from './services/deployment.ts';
import { KubernetesHelmChartService } from './services/helm-chart.ts';
import { KubernetesIngressRuleService } from './services/ingress-rule.ts';
import { KubernetesNamespaceService } from './services/namespace.ts';
import { KubernetesServiceService } from './services/service.ts';
import { kubectlExec } from './utils.ts';

export default class KubernetesProvider extends Provider<KubernetesCredentials> {
  readonly type = 'kubernetes';

  static readonly CredentialsSchema = KubernetesCredentialsSchema;

  readonly resources = {
    namespace: new KubernetesNamespaceService(this.name, this.credentials, this.providerStore),
    deployment: new KubernetesDeploymentService(this.name, this.credentials, this.providerStore),
    service: new KubernetesServiceService(this.name, this.credentials, this.providerStore),
    ingressRule: new KubernetesIngressRuleService(this.name, this.credentials, this.providerStore),
    helmChart: new KubernetesHelmChartService(this.name, this.credentials, this.providerStore),
  };

  public async testCredentials(): Promise<boolean> {
    try {
      const cmdOutput = await kubectlExec(this.credentials, ['version']);
      const version = JSON.parse(cmdOutput.stdout);
      const clientVersion = version.clientVersion;
      return Number(clientVersion.major) >= 1 && Number(clientVersion.minor) >= 18;
    } catch {
      return false;
    }
  }
}
