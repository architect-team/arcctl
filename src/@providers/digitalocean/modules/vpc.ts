import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule } from '../../module.ts';
import { Vpc } from '../.gen/providers/digitalocean/vpc/index.ts';
import { DigitaloceanCredentials } from '../credentials.ts';
import { Construct } from 'npm:constructs';

export class DigitaloceanVpcModule extends ResourceModule<
  'vpc',
  DigitaloceanCredentials
> {
  vpc: Vpc;
  outputs: ResourceOutputs['vpc'];

  constructor(scope: Construct, id: string, inputs: ResourceInputs['vpc']) {
    super(scope, id, inputs);

    this.vpc = new Vpc(this, 'vpc', {
      description: inputs.description,
      name: inputs.name || 'delete',
      region: inputs.region || 'nyc1',
    });

    this.outputs = {
      id: this.vpc.id,
      name: this.vpc.name,
      description: this.vpc.description,
      region: this.vpc.region,
    };
  }

  async genImports(
    credentials: DigitaloceanCredentials,
    resourceId: string,
  ): Promise<Record<string, string>> {
    return {
      [this.getResourceRef(this.vpc)]: resourceId,
    };
  }

  getDisplayNames(): Record<string, string> {
    return {
      [this.getResourceRef(this.vpc)]: 'VPC',
    };
  }
}
