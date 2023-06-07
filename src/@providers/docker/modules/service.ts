import { Construct } from 'constructs';
import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule } from '../../module.ts';
import { DockerCredentials } from '../credentials.ts';

export class DockerServiceModule extends ResourceModule<
  'service',
  DockerCredentials
> {
  outputs: ResourceOutputs['service'];

  constructor(scope: Construct, id: string, inputs: ResourceInputs['service']) {
    super(scope, id, inputs);

    const protocol = inputs.protocol || 'http';
    const host = inputs.selector || '';
    const port = inputs.target_port;
    const url = `${protocol}://${host}:${port}`;

    this.outputs = {
      id: url,
      host,
      port,
      protocol,
      url,
    };
  }

  async genImports(
    credentials: DockerCredentials,
    resourceId: string,
  ): Promise<Record<string, string>> {
    return {};
  }

  getDisplayNames(): Record<string, string> {
    return {};
  }
}
