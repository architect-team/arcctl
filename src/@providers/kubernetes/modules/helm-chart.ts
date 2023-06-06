import { Construct } from 'constructs';
import yaml from 'js-yaml';
import { ResourceInputs, ResourceOutputs } from '../../../@resources/types.ts';
import { ResourceModule } from '../../module.ts';
import { Release } from '../.gen/providers/helm/release/index.ts';
import { KubernetesCredentials } from '../credentials.ts';

export class KubernetesHelmChartModule extends ResourceModule<
  'helmChart',
  KubernetesCredentials
> {
  outputs: ResourceOutputs['helmChart'];
  release: Release;

  constructor(
    scope: Construct,
    id: string,
    inputs: ResourceInputs['helmChart'],
  ) {
    super(scope, id, inputs);

    this.release = new Release(this, 'chart', {
      name: inputs.name,
      namespace: inputs.namespace,
      repository: inputs.repository,
      chart: inputs.chart,
      version: inputs.version,
      values: [yaml.dump(inputs.values || {})],
    });

    this.outputs = {
      id: inputs.namespace ? `${inputs.namespace}/${inputs.name}` : inputs.name,
    };
  }

  // deno-lint-ignore require-await
  async genImports(
    credentials: KubernetesCredentials,
    resourceId: string,
  ): Promise<Record<string, string>> {
    return {
      [this.getResourceRef(this.release)]: resourceId,
    };
  }

  getDisplayNames(): Record<string, string> {
    return {
      [this.getResourceRef(this.release)]: 'Helm chart',
    };
  }
}
