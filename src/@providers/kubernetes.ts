import CloudCtlConfig from '../utils/config.ts';
import { deleteProvider, getProviders, saveFile, saveProvider } from '../utils/providers.ts';
import KubernetesProvider from './kubernetes/provider.ts';
import { SupportedProviders } from './supported-providers.ts';
import { colors } from 'cliffy/ansi/colors.ts';
import { existsSync } from 'std/fs/exists.ts';
import yaml from 'js-yaml';
import * as path from 'std/path/mod.ts';
import untildify from 'untildify';

export default class KubernetesUtils {
  private static getProviderName(clusterName: string): string {
    return `cldctl--cluster--${clusterName}`;
  }

  static async createProvider(clusterName: string, kubeConfig: string): Promise<void> {
    const newProviderName = this.getProviderName(clusterName);
    const filePath = path.join(CloudCtlConfig.getConfigDirectory(), `${newProviderName}.yml`);
    await Deno.writeTextFile(filePath, kubeConfig);
    const newProvider = new SupportedProviders.kubernetes(
      newProviderName,
      {
        configPath: filePath,
      },
      // Not being used so does not matter if its correct
      saveFile(),
    );
    await saveProvider(newProvider);
    await this.addToKubeConfig(kubeConfig);
  }

  static async deleteProvider(clusterName: string): Promise<void> {
    const providerName = this.getProviderName(clusterName);
    const providers = await getProviders();
    const provider = providers.find((provider) => {
      return provider.name === providerName;
    }) as KubernetesProvider | undefined;
    // Check to see if we even own the proivder
    if (!provider) {
      return;
    }
    await deleteProvider(providerName);
    await this.removeFromKubeConfig(clusterName);
    if (provider.credentials.configPath) {
      await Deno.remove(provider.credentials.configPath);
    }
  }

  static async removeFromKubeConfig(name: string): Promise<void> {
    const kubeConfigPath = untildify('~/.kube/config');
    if (!existsSync(kubeConfigPath)) {
      return;
    }
    const kubeConfigContents = await Deno.readTextFile(kubeConfigPath);
    const credentials = yaml.load(kubeConfigContents.toString()) as any;

    for (const key of ['clusters', 'users', 'contexts']) {
      const index = credentials[key].findIndex((item: any) => {
        return item.name === name;
      });

      if (index !== -1) {
        credentials[key].splice(index, 1);
      }
    }

    await Deno.writeTextFile(untildify('~/.kube/cldctl-backup'), kubeConfigContents);
    await Deno.writeTextFile(untildify('~/.kube/config'), yaml.dump(credentials));
  }

  static async addToKubeConfig(credentialsYaml: string): Promise<void> {
    const kubeConfigPath = untildify('~/.kube/config');
    if (!existsSync(kubeConfigPath)) {
      await Deno.mkdir(kubeConfigPath, {
        recursive: true,
      });
      Deno.writeTextFile(kubeConfigPath, credentialsYaml);
    }
    const newCredentials = yaml.load(credentialsYaml) as any;
    const kubeConfigContents = await Deno.readTextFile(kubeConfigPath);
    const credentials = yaml.load(kubeConfigContents) as any;

    for (const key of ['clusters', 'users', 'contexts']) {
      const name = newCredentials[key][0].name;
      const value = newCredentials[key][0];
      const index = credentials[key].findIndex((item: any) => {
        return item.name === name;
      });

      if (index === -1) {
        credentials[key].push(value);
      } else {
        credentials[key][index] = value;
      }
    }

    await Deno.writeTextFile(untildify('~/.kube/cldctl-backup'), kubeConfigContents);
    await Deno.writeTextFile(untildify('~/.kube/config'), yaml.dump(credentials));
  }

  static afterCreateClusterHelpText(): void {
    console.log(`
Now that your cluster has finished creating, we will modify your kube config file to add its credentials.
You can view your kube config file using the Kubernetes command line tool ${colors.yellow('$ kubectl config view')}
To explore other kubectl commands to communicate with your cluster, goto https://kubernetes.io/docs/reference/kubectl/
To register your cluster with Architect cloud, use command ${colors.yellow('$ architect cluster:create')}
    `);
  }
}
