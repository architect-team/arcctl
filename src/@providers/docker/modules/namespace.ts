import { Construct } from 'constructs';
import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule } from '../../module.ts';
import { Network } from '../.gen/providers/docker/network/index.ts';
import { DockerCredentials } from '../credentials.ts';

export class DockerNamespaceModule extends ResourceModule<
  'namespace',
  DockerCredentials
> {
  private network: Network;
  outputs: ResourceOutputs['namespace'];

  constructor(
    scope: Construct,
    id: string,
    inputs: ResourceInputs['namespace'],
  ) {
    super(scope, id, inputs);

    this.network = new Network(this, inputs.name, {
      name: inputs.name,
      attachable: true,
    });

    this.outputs = {
      id: this.network.id,
    };
  }

  // deno-lint-ignore require-await
  async genImports(
    credentials: DockerCredentials,
    resourceId: string,
  ): Promise<Record<string, string>> {
    return {
      [this.getResourceRef(this.network)]: resourceId,
    };
  }

  getDisplayNames(): Record<string, string> {
    return {
      [this.getResourceRef(this.network)]: 'Network',
    };
  }
}
