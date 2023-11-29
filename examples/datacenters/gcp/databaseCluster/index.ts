import * as gcp from "@pulumi/gcp";
import * as pulumi from "@pulumi/pulumi";
import { randomUUID } from 'crypto';

const config = new pulumi.Config('databaseCluster');
const gcpConfig = new pulumi.Config('gcp');
const _port = config.require('databasePort');

const databaseInstance = new gcp.sql.DatabaseInstance(config.require('name'), {
  region: gcpConfig.require('region'),
  name: config.require('name'),
  databaseVersion: config.require('databaseVersion'),
  rootPassword: randomUUID(),
  settings: {
    tier: config.get('databaseSize') || 'db-f1-micro',
    ipConfiguration: {
      privateNetwork: config.require('vpcId'),
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
