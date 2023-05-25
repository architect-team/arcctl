import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule } from '../../module.ts';
import { DockerCredentials } from '../credentials.ts';
import { Construct } from 'constructs';

export class DockerLoadBalancerModule extends ResourceModule<
  'loadBalancer',
  DockerCredentials
> {
  outputs: ResourceOutputs['loadBalancer'];

  constructor(
    scope: Construct,
    id: string,
    inputs: ResourceInputs['loadBalancer'],
  ) {
    super(scope, id, inputs);
  }

  genImports(
    credentials: DockerCredentials,
    resourceId: string,
  ): Promise<Record<string, string>> {
    throw new Error('Method not implemented.');
  }

  getDisplayNames(): Record<string, string> {
    throw new Error('Method not implemented.');
  }
}
