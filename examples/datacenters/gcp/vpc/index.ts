import * as gcp from "@pulumi/gcp";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();
const gcpConfig = new pulumi.Config('gcp');
const vpcName = config.require('name');

const _computeProjectService = new gcp.projects.Service('vpc-compute-service', {
  service: 'compute.googleapis.com',
  disableOnDestroy: false,
});

const _serviceNetworkingProjectService = new gcp.projects.Service('vpc-networking-service', {
  service: 'servicenetworking.googleapis.com',
  disableOnDestroy: false,
});

const vpcNetwork = new gcp.compute.Network('vpc', {
  name: vpcName,
  description: config.get('description'),
  autoCreateSubnetworks: true,
}, {
  dependsOn: [_computeProjectService, _serviceNetworkingProjectService]
});

const computeGlobalAddress = new gcp.compute.GlobalAddress('vpc-address', {
  name: `${vpcName}-ip-range`,
  network: vpcNetwork.id,
  purpose: 'VPC_PEERING',
  addressType: 'INTERNAL',
  prefixLength: 16,
});

// This is used for connecting to the database via private subnet
const _networkingConnection = new gcp.servicenetworking.Connection('vpc-networking-conn', {
  network: vpcNetwork.id,
  service: 'servicenetworking.googleapis.com',
  reservedPeeringRanges: [computeGlobalAddress.name],
}, {
  dependsOn: [_computeProjectService, _serviceNetworkingProjectService]
});

const gcp_region = gcpConfig.require('region');

// Note: This is only necessary for serverless.
/*
const vpcConnectorSubnet = new gcp.compute.Subnetwork('vpc-subnet', {
  name: `${vpcName}-subnet`,
  ipCidrRange: '10.8.0.0/28',
  region: gcp_region,
  network: vpcNetwork.id,
});

const _vpcAccessProjectService = new gcp.projects.Service('vpc-access-service', {
  service: 'vpcaccess.googleapis.com',
  disableOnDestroy: false,
});

const _vpcAccessConnector = new gcp.vpcaccess.Connector(`vpc-access-connector`, {
  name: `${vpcName.substring(0, 15)}-connector`, // 25 char max
  machineType: 'e2-micro',
  region: gcp_region,
  minInstances: 2,
  maxInstances: 3,
  subnet: {
    name: vpcConnectorSubnet.name,
  },
}, {
  dependsOn: [_vpcAccessProjectService],
});
*/

export const id = vpcNetwork.id;
export const name = vpcNetwork.name;
export const region = gcp_region;
export const description = vpcNetwork.description;
