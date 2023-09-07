import { exec, ExecOutput } from '../../utils/command.ts';
import { KubernetesCredentials } from './credentials.ts';

export async function kubectlExec(credentials: KubernetesCredentials, args: string[]): Promise<ExecOutput> {
  const configuration = [
    '--output=json',
  ];
  if (credentials.configPath) {
    console.log(`Using kube context: ${credentials.configPath}`);
    configuration.push(`--kubeconfig=${credentials.configPath}`);
  }
  if (credentials.configContext) {
    console.log(`Using kube context: ${credentials.configContext}`);
    configuration.push(`--context=${credentials.configContext}`);
  }
  return exec('kubectl', {
    args: [
      ...configuration,
      ...args,
    ],
  });
}
