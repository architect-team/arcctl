import { Construct } from 'constructs';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule, ResourceModuleOptions } from '../../module.ts';
import { ComputeGlobalAddress } from '../.gen/providers/google/compute-global-address/index.ts';
import { ComputeNetwork } from '../.gen/providers/google/compute-network/index.ts';
import { ProjectService } from '../.gen/providers/google/project-service/index.ts';
import { ServiceNetworkingConnection } from '../.gen/providers/google/service-networking-connection/index.ts';
import { GoogleCloudCredentials } from '../credentials.ts';
import GcpUtils from '../utils.ts';

export class GoogleCloudVpcModule extends ResourceModule<'vpc', GoogleCloudCredentials> {
  vpc: ComputeNetwork;
  outputs: ResourceOutputs['vpc'];

  constructor(scope: Construct, options: ResourceModuleOptions<'vpc', GoogleCloudCredentials>) {
    super(scope, options);

    GcpUtils.configureProvider(this);

    const depends_on = this.inputs?.name
      ? [
        new ProjectService(this, 'vpc-compute-service', {
          service: 'compute.googleapis.com',
          disableOnDestroy: false,
        }),
        new ProjectService(this, 'vpc-networking-service', {
          service: 'servicenetworking.googleapis.com',
          disableOnDestroy: false,
        }),
      ]
      : [];

    const vpc_name = this.inputs?.name || 'deleting';

    this.vpc = new ComputeNetwork(this, 'vpc', {
      dependsOn: depends_on,
      name: vpc_name,
      description: this.inputs?.description,
      autoCreateSubnetworks: true,
    });

    const address = new ComputeGlobalAddress(this, 'vpc-address', {
      name: `${vpc_name}-ip-range`,
      network: this.vpc.id,
      purpose: 'VPC_PEERING',
      addressType: 'INTERNAL',
      prefixLength: 16,
    });

    const _networking_connection = new ServiceNetworkingConnection(this, 'vpc-networking-conn', {
      dependsOn: depends_on,
      network: this.vpc.id,
      service: 'servicenetworking.googleapis.com',
      reservedPeeringRanges: [address.name],
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
