import k8s, { ApiType } from '@kubernetes/client-node';
import { KubernetesCredentials } from './credentials.ts';

type ApiConstructor<T extends ApiType> = new (server: string) => T;
export default class KubernetesUtils {
  public static getKubeConfig(credentials: KubernetesCredentials): k8s.KubeConfig {
    const kubeConfig = new k8s.KubeConfig();
    if (credentials.configPath) {
      kubeConfig.loadFromFile(credentials.configPath);
    } else {
      kubeConfig.loadFromDefault();
    }

    if (credentials.configContext) {
      kubeConfig.setCurrentContext(credentials.configContext);
    }

    return kubeConfig;
  }

  public static getClient<T extends ApiType>(credentials: KubernetesCredentials, apiClientType: ApiConstructor<T>): T {
    const kubeConfig = KubernetesUtils.getKubeConfig(credentials);
    return kubeConfig.makeApiClient(apiClientType);
  }
}
