import { Provider } from '../provider.js';
import { HelmProvider as TerraformHelmProvider } from './.gen/providers/helm/provider/index.js';
import { KubernetesProvider as TerraformKubernetesProvider } from './.gen/providers/kubernetes/provider/index.js';
import {
  KubernetesCredentials,
  KubernetesCredentialsSchema,
} from './credentials.js';
import { KubernetesDeploymentService } from './services/deployment.js';
import { KubernetesHelmChartService } from './services/helm-chart.js';
import { KubernetesIngressRuleService } from './services/ingress-rule.js';
import { KubernetesNamespaceService } from './services/namespace.js';
import { KubernetesServiceService } from './services/service.js';
import k8s from '@kubernetes/client-node';
import { Construct } from 'constructs';

export default class KubernetesProvider extends Provider<KubernetesCredentials> {
  readonly type = 'kubernetes';
  readonly terraform_version = '1.4.6';

  static readonly CredentialsSchema = KubernetesCredentialsSchema;

  readonly resources = {
    namespace: new KubernetesNamespaceService(this.credentials),
    deployment: new KubernetesDeploymentService(this.credentials),
    service: new KubernetesServiceService(this.credentials),
    ingressRule: new KubernetesIngressRuleService(this.credentials),
    helmChart: new KubernetesHelmChartService(),
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

  public configureTerraformProviders(scope: Construct): void {
    new TerraformKubernetesProvider(scope, this.name, {
      configPath: this.credentials.configPath,
      configContext: this.credentials.configContext,
    });

    new TerraformHelmProvider(scope, `${this.name}-helm`, {
      kubernetes: {
        configPath: this.credentials.configPath,
        configContext: this.credentials.configContext,
      },
    });
  }
}
