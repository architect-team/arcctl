import { Construct } from 'constructs';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule, ResourceModuleOptions } from '../../module.ts';
import { ComputeNetwork } from '../.gen/providers/google/compute-network/index.ts';
import { ProjectService } from '../.gen/providers/google/project-service/index.ts';
import { GoogleCloudCredentials } from '../credentials.ts';

export class GoogleCloudVpcModule extends ResourceModule<'vpc', GoogleCloudCredentials> {
  vpc: ComputeNetwork;
  outputs: ResourceOutputs['vpc'];

  constructor(scope: Construct, options: ResourceModuleOptions<'vpc', GoogleCloudCredentials>) {
    super(scope, options);

    const depends_on = this.inputs?.name
      ? [
        new ProjectService(this, 'vpc-compute-service', {
          service: 'compute.googleapis.com',
        }),
      ]
      : [];

    this.vpc = new ComputeNetwork(this, 'vpc', {
      dependsOn: depends_on,
      name: this.inputs?.name || 'deleting',
      description: this.inputs?.description,
      autoCreateSubnetworks: true,
    });

    this.outputs = {
      id: this.vpc.id,
      name: this.vpc.name,
      region: '',
      description: this.vpc.description,
    };
  }

  async genImports(
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
