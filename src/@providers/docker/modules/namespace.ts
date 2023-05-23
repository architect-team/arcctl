import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.js';
import { ResourceModule } from '../../module.js';
import { Network } from '../.gen/providers/docker/network/index.js';
import { DockerCredentials } from '../credentials.js';
import { Construct } from 'constructs';

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
