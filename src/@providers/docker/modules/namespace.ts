import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule } from '../../module.ts';
import { Network } from '../.gen/providers/docker/network/index.ts';
import { DockerCredentials } from '../credentials.ts';
import { Construct } from 'npm:constructs';

export class DockerNetworkModule extends ResourceModule<
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
