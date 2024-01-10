import * as gcp from "@pulumi/gcp";

const inputs = process.env.INPUTS;
if (!inputs) {
  throw new Error('Missing configuration. Please provide it via the INPUTS environment variable.');
}

type Config = {
  name: string;
  region: string;
  project: string;
  credentials: string;
  description?: string;
};

const config: Config = JSON.parse(inputs);

const provider = new gcp.Provider('provider', {
  region: config.region,
  project: config.project,
  credentials: config.credentials,
});

const _computeProjectService = new gcp.projects.Service('vpc-compute-service', {
  service: 'compute.googleapis.com',
  disableOnDestroy: false,
}, { provider });

const _serviceNetworkingProjectService = new gcp.projects.Service('vpc-networking-service', {
  service: 'servicenetworking.googleapis.com',
  disableOnDestroy: false,
}, { provider });

const vpcNetwork = new gcp.compute.Network('vpc', {
  name: config.name,
  description: config.description,
  autoCreateSubnetworks: true,
}, {
  provider,
  dependsOn: [_computeProjectService, _serviceNetworkingProjectService]
});

const computeGlobalAddress = new gcp.compute.GlobalAddress('vpc-address', {
  name: `${config.name}-ip-range`,
  network: vpcNetwork.id,
  purpose: 'VPC_PEERING',
  addressType: 'INTERNAL',
  prefixLength: 16,
}, { provider });

// This is used for connecting to the database via private subnet
new gcp.servicenetworking.Connection('vpc-networking-conn', {
  network: vpcNetwork.id,
  service: 'servicenetworking.googleapis.com',
  reservedPeeringRanges: [computeGlobalAddress.name],
}, {
  provider,
  dependsOn: [_computeProjectService, _serviceNetworkingProjectService]
});

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
export const region = config.region;
export const description = vpcNetwork.description;
