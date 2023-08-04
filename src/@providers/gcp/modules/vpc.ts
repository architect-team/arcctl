import { Construct } from 'constructs';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule, ResourceModuleOptions } from '../../module.ts';
import { ComputeGlobalAddress } from '../.gen/providers/google/compute-global-address/index.ts';
import { ComputeNetwork } from '../.gen/providers/google/compute-network/index.ts';
import { ComputeSubnetwork } from '../.gen/providers/google/compute-subnetwork/index.ts';
import { ProjectService } from '../.gen/providers/google/project-service/index.ts';
import { ServiceNetworkingConnection } from '../.gen/providers/google/service-networking-connection/index.ts';
import { VpcAccessConnector } from '../.gen/providers/google/vpc-access-connector/index.ts';
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

    // Used for database private ip address connections
    const _networking_connection = new ServiceNetworkingConnection(this, 'vpc-networking-conn', {
      dependsOn: depends_on,
      network: this.vpc.id,
      service: 'servicenetworking.googleapis.com',
      reservedPeeringRanges: [address.name],
    });

    const region = !this.inputs?.region ? 'us-east4-a' : this.inputs.region.split('-').slice(0, -1).join('-');

    // Following two only used for serverless connections to a database
    const vpc_connector_subnet = new ComputeSubnetwork(this, 'vpc-subnet', {
      name: `${vpc_name}-subnet`,
      ipCidrRange: '10.8.0.0/28',
      region,
      network: this.vpc.id,
    });

    // TODO: We only want/need to create this for serverless deployments, but idk how
    const _vpc_access_connector = new VpcAccessConnector(this, `vpc-access-connector`, {
      dependsOn: [
        new ProjectService(this, 'vpc-access-service', {
          service: 'vpcaccess.googleapis.com',
          disableOnDestroy: false,
        }),
      ],
      name: `${vpc_name.substring(0, 15)}-connector`, // 25 char max
      machineType: 'e2-micro',
      region,
      minInstances: 2,
      maxInstances: 3,
      subnet: {
        name: vpc_connector_subnet.name,
      },
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
