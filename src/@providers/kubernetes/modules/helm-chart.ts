import { Construct } from 'constructs';
import yaml from 'js-yaml';
import { ResourceOutputs } from '../../../@resources/types.ts';
import { ResourceModule, ResourceModuleOptions } from '../../module.ts';
import { Release } from '../.gen/providers/helm/release/index.ts';
import { KubernetesCredentials } from '../credentials.ts';

export class KubernetesHelmChartModule extends ResourceModule<'helmChart', KubernetesCredentials> {
  outputs: ResourceOutputs['helmChart'];
  release: Release;

  constructor(scope: Construct, options: ResourceModuleOptions<'helmChart', KubernetesCredentials>) {
    super(scope, options);

    this.release = new Release(this, 'chart', {
      name: this.inputs?.name || 'unknown',
      namespace: this.inputs?.namespace,
      repository: this.inputs?.repository || 'unknown',
      chart: this.inputs?.chart || 'unknown',
      version: this.inputs?.version,
      values: [yaml.dump(this.inputs?.values || {})],
    });

    this.outputs = {
      id: this.inputs?.namespace ? `${this.inputs.namespace}/${this.inputs.name}` : this.inputs?.name || 'unknown',
    };
  }

  genImports(resourceId: string): Promise<Record<string, string>> {
    return Promise.resolve({
      [this.getResourceRef(this.release)]: resourceId,
    });
  }

  getDisplayNames(): Record<string, string> {
    return {
      [this.getResourceRef(this.release)]: 'Helm chart',
    };
  }
}
