import { ResourceInputs, ResourceOutputs } from '../../../@resources/types.js';
import { ResourceModule } from '../../module.js';
import { Release } from '../.gen/providers/helm/release/index.js';
import { KubernetesCredentials } from '../credentials.js';
import { Construct } from 'npm:constructs';
import yaml from 'js-yaml';

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
