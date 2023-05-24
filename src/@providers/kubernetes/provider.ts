import { Provider, ProviderResources } from '../provider.ts';
import { HelmProvider as TerraformHelmProvider } from './.gen/providers/helm/provider/index.ts';
import { KubernetesProvider as TerraformKubernetesProvider } from './.gen/providers/kubernetes/provider/index.ts';
import {
  KubernetesCredentials,
  KubernetesCredentialsSchema,
} from './credentials.ts';
import { KubernetesDeploymentService } from './services/deployment.ts';
import { KubernetesHelmChartService } from './services/helm-chart.ts';
import { KubernetesIngressRuleService } from './services/ingress-rule.ts';
import { KubernetesNamespaceService } from './services/namespace.ts';
import { KubernetesServiceService } from './services/service.ts';
import k8s from '@kubernetes/client-node';
import { Construct } from 'npm:constructs';

export default class KubernetesProvider extends Provider<KubernetesCredentials> {
  readonly type = 'kubernetes';
  readonly terraform_version = '1.4.6';

  static readonly CredentialsSchema = KubernetesCredentialsSchema;

  readonly resources: ProviderResources<KubernetesCredentials> = {
    kubernetesNamespace: new KubernetesNamespaceService(this.credentials),
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
    const res = await client.getCode();
    return Number(res.body.major) >= 1 && Number(res.body.minor) >= 18;
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
