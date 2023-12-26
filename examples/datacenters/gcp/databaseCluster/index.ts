import * as gcp from "@pulumi/gcp";
import * as pulumi from "@pulumi/pulumi";
import { randomUUID } from 'crypto';

const inputs = process.env.INPUTS;
if (!inputs) {
  throw new Error('Missing configuration. Please provide it via the INPUTS environment variable.');
}

type Config = {
  name: string;
  databasePort: number;
  databaseVersion: string;
  databaseSize?: string;
  vpcId: string;
};

const config: Config = JSON.parse(inputs);

const gcpConfig = new pulumi.Config('gcp');
const _port = config.databasePort;

const databaseInstance = new gcp.sql.DatabaseInstance(config.name, {
  region: gcpConfig.require('region'),
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
});

export const id = databaseInstance.id;
export const private_host = databaseInstance.privateIpAddress;
export const host = databaseInstance.ipAddresses[0];
export const port = _port;
export const username = databaseInstance.serviceAccountEmailAddress;
export const password = databaseInstance.rootPassword;
