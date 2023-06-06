import { ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule, ResourceModuleOptions } from '../../module.ts';
import { Vpc } from '../.gen/providers/digitalocean/vpc/index.ts';
import { DigitaloceanCredentials } from '../credentials.ts';
import { Construct } from 'constructs';

export class DigitaloceanVpcModule extends ResourceModule<'vpc', DigitaloceanCredentials> {
  vpc: Vpc;
  outputs: ResourceOutputs['vpc'];

  constructor(scope: Construct, options: ResourceModuleOptions<'vpc'>) {
    super(scope, options);

    this.vpc = new Vpc(this, 'vpc', {
      description: this.inputs?.description,
      name: this.inputs?.name || 'unknown',
      region: this.inputs?.region || 'nyc1',
    });

    this.outputs = {
      id: this.vpc.id,
      name: this.vpc.name,
      description: this.vpc.description,
      region: this.vpc.region,
    };
  }

  genImports(_credentials: DigitaloceanCredentials, resourceId: string): Promise<Record<string, string>> {
    return Promise.resolve({
      [this.getResourceRef(this.vpc)]: resourceId,
    });
  }

  getDisplayNames(): Record<string, string> {
    return {
      [this.getResourceRef(this.vpc)]: 'VPC',
    };
  }
}
