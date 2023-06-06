import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule } from '../../module.ts';
import { Vpc } from '../.gen/modules/vpc.ts';
import { DataAwsAvailabilityZones } from '../.gen/providers/aws/data-aws-availability-zones/index.ts';
import { AwsProvider } from '../.gen/providers/aws/provider/index.ts';
import { AwsCredentials } from '../credentials.ts';
import AwsUtils from '../utils.ts';
import { Construct } from 'constructs';

export class AwsVpcModule extends ResourceModule<'vpc', AwsCredentials> {
  vpc: Vpc;
  outputs: ResourceOutputs['vpc'];

  constructor(scope: Construct, id: string, inputs: ResourceInputs['vpc']) {
    super(scope, id, inputs);

    if (inputs.region) {
      const aws_provider = this.scope.node.children.find(
        (child) => child instanceof AwsProvider,
      ) as any;
      aws_provider.region = inputs.region;
    }

    const ipRange = '10.0.0.0/16';

    const [ip] = ipRange.split('/');
    const ipParts = ip.split('.').map((ele) => Number.parseInt(ele));

    const privateSubnets: string[] = [];
    const publicSubnets: string[] = [];

    for (let i = 0; i < 3; i++) {
      privateSubnets.push(`${ipParts.join('.')}/24`);
      ipParts[2]++;
    }
    for (let i = 0; i < 3; i++) {
      publicSubnets.push(`${ipParts.join('.')}/24`);
      ipParts[2]++;
    }

    const allAvailabilityZones = new DataAwsAvailabilityZones(
      this,
      'all-availability-zones',
      {},
    ).names;

    this.vpc = new Vpc(this, 'vpc', {
      azs: allAvailabilityZones,
      name: inputs.name,
      cidr: ipRange,
      privateSubnets,
      publicSubnets,
      enableDnsHostnames: true,
      enableNatGateway: true,
      singleNatGateway: true,
      tags: {
        architectResourceId: inputs.name,
      },
      publicSubnetTags: {
        'kubernetes.io/role/elb': '1',
        architectResourceId: inputs.name,
      },
      privateSubnetTags: {
        'kubernetes.io/role/internal-elb': '1',
        architectResourceId: inputs.name,
      },
    });

    this.outputs = {
      id: `${this.inputs.region}/${this.vpc.vpcIdOutput}`,
      name: this.vpc.name!,
      region: this.inputs.region,
    };
  }

  async genImports(
    credentials: AwsCredentials,
    resourceId: string,
  ): Promise<Record<string, string>> {
    const match = resourceId.match(/^([\dA-Za-z-]+)\/([\w-]+)$/);
    if (!match) {
      throw new Error('ID must be of the format, <region>/<uuid>');
    }

    const [_, region, vpcId] = match;

    const aws_provider = this.scope.node.children[0] as AwsProvider;
    aws_provider.region = region;

    const moduleId = ['module', this.vpc.friendlyUniqueId].join('.');

    const name = await AwsUtils.getNameForVpc(credentials, region, vpcId);
    const routeIds = await AwsUtils.getRouteIdsForVpc(
      credentials,
      region,
      vpcId,
    );
    const subnetIds = await AwsUtils.getSubnetIdsForVpc(
      credentials,
      region,
      vpcId,
    );
    const natGateways = await AwsUtils.getNatGateways(
      credentials,
      region,
      vpcId,
    );
    const eipId = await AwsUtils.getElasticIPs(credentials, region, name);

    return {
      [`${moduleId}.aws_vpc.this[0]`]: vpcId,
      [`${moduleId}.aws_route_table.public[0]`]: routeIds.public[0],
      [`${moduleId}.aws_route_table.private[0]`]: routeIds.private[0],
      [`${moduleId}.aws_subnet.public[0]`]: subnetIds.public[0],
      [`${moduleId}.aws_subnet.public[1]`]: subnetIds.public[1],
      [`${moduleId}.aws_subnet.public[2]`]: subnetIds.public[2],
      [`${moduleId}.aws_subnet.private[0]`]: subnetIds.private[0],
      [`${moduleId}.aws_subnet.private[1]`]: subnetIds.private[1],
      [`${moduleId}.aws_subnet.private[2]`]: subnetIds.private[2],
      [`${moduleId}.aws_internet_gateway.this[0]`]: routeIds.publicGatewayIds[0],
      [`${moduleId}.aws_nat_gateway.this[0]`]: natGateways[0],
      [`${moduleId}.aws_eip.nat[0]`]: eipId,
    };
  }

  getDisplayNames(): Record<string, string> {
    const moduleId = ['module', this.vpc.friendlyUniqueId].join('.');
    return {
      [`${moduleId}.aws_vpc.this[0]`]: 'VPC',
      [`${moduleId}.aws_nat_gateway.this[0]`]: 'NAT Gateway',
    };
  }
}
