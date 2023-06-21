import k8s from '@kubernetes/client-node';
import { Provider } from '../provider.ts';
import { KubernetesCredentials, KubernetesCredentialsSchema } from './credentials.ts';
import { KubernetesDeploymentService } from './services/deployment.ts';
import { KubernetesHelmChartService } from './services/helm-chart.ts';
import { KubernetesIngressRuleService } from './services/ingress-rule.ts';
import { KubernetesNamespaceService } from './services/namespace.ts';
import { KubernetesPodService } from './services/pod.ts';
import { KubernetesServiceService } from './services/service.ts';
import KubernetesUtils from './utils.ts';

export default class KubernetesProvider extends Provider<KubernetesCredentials> {
  readonly type = 'kubernetes';

  static readonly CredentialsSchema = KubernetesCredentialsSchema;

  readonly resources = {
    namespace: new KubernetesNamespaceService(this.name, this.credentials, this.providerStore),
    deployment: new KubernetesDeploymentService(this.name, this.credentials, this.providerStore),
    service: new KubernetesServiceService(this.name, this.credentials, this.providerStore),
    ingressRule: new KubernetesIngressRuleService(this.name, this.credentials, this.providerStore),
    helmChart: new KubernetesHelmChartService(this.name, this.credentials, this.providerStore),
    pod: new KubernetesPodService(this.name, this.credentials, this.providerStore),
  };

  public async testCredentials(): Promise<boolean> {
    const client = KubernetesUtils.getClient(this.credentials, k8s.VersionApi);
    try {
      const res = await client.getCode();
      return Number(res.body.major) >= 1 && Number(res.body.minor) >= 18;
    } catch {
      return false;
    }
  }
}
