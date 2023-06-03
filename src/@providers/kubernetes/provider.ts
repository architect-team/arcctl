import { Provider } from '../provider.ts';
import { KubernetesCredentials, KubernetesCredentialsSchema } from './credentials.ts';
import { KubernetesDeploymentService } from './services/deployment.ts';
import { KubernetesHelmChartService } from './services/helm-chart.ts';
import { KubernetesIngressRuleService } from './services/ingress-rule.ts';
import { KubernetesNamespaceService } from './services/namespace.ts';
import { KubernetesServiceService } from './services/service.ts';
import k8s from '@kubernetes/client-node';

export default class KubernetesProvider extends Provider<KubernetesCredentials> {
  readonly type = 'kubernetes';
  readonly terraform_version = '1.4.6';

  static readonly CredentialsSchema = KubernetesCredentialsSchema;

  readonly resources = {
    namespace: new KubernetesNamespaceService(this.credentials),
    deployment: new KubernetesDeploymentService(this.credentials),
    service: new KubernetesServiceService(this.credentials),
    ingressRule: new KubernetesIngressRuleService(this.credentials),
    helmChart: new KubernetesHelmChartService(this.credentials),
  };

  public async testCredentials(): Promise<boolean> {
    const kubeConfig = new k8s.KubeConfig();
    if (this.credentials.configPath) {
      kubeConfig.loadFromFile(this.credentials.configPath);
    } else {
      kubeConfig.loadFromDefault();
    }

    if (this.credentials.configContext) {
      kubeConfig.setCurrentContext(this.credentials.configContext);
    }

    const client = kubeConfig.makeApiClient(k8s.VersionApi);
    try {
      const res = await client.getCode();
      return Number(res.body.major) >= 1 && Number(res.body.minor) >= 18;
    } catch {
      return false;
    }
  }
}
