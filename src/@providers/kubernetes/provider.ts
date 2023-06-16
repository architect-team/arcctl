import k8s from '@kubernetes/client-node';
import { Provider } from '../provider.ts';
import { KubernetesCredentials, KubernetesCredentialsSchema } from './credentials.ts';
import { KubernetesDeploymentService } from './services/deployment.ts';
import { KubernetesHelmChartService } from './services/helm-chart.ts';
import { KubernetesIngressRuleService } from './services/ingress-rule.ts';
import { KubernetesNamespaceService } from './services/namespace.ts';
import { KubernetesServiceService } from './services/service.ts';

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
