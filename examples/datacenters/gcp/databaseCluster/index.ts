import * as gcp from "@pulumi/gcp";
import { randomUUID } from 'crypto';

const inputs = process.env.INPUTS;
if (!inputs) {
  throw new Error('Missing configuration. Please provide it via the INPUTS environment variable.');
}

type Config = {
  name: string;
  region: string;
  project: string;
  credentials: string;
  databasePort: number;
  databaseVersion: string;
  databaseSize?: string;
  vpcId: string;
};

const config: Config = JSON.parse(inputs);

const provider = new gcp.Provider('gcp-provider', {
  credentials: config.credentials,
  project: config.project,
  region: config.region,
});

const _port = config.databasePort;

const databaseInstance = new gcp.sql.DatabaseInstance(config.name, {
  region: config.region,
  name: config.name,
  databaseVersion: config.databaseVersion,
  rootPassword: randomUUID(),
  settings: {
    tier: config.databaseSize || 'db-f1-micro',
    ipConfiguration: {
      privateNetwork: config.vpcId,
      enablePrivatePathForGoogleCloudServices: true,
    },
  },
  deletionProtection: false
}, { provider });

export const id = databaseInstance.id;
export const private_host = databaseInstance.privateIpAddress;
export const host = databaseInstance.ipAddresses[0];
export const port = _port;
export const username = databaseInstance.serviceAccountEmailAddress;
export const password = databaseInstance.rootPassword;
