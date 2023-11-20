import * as gcp from "@pulumi/gcp";
import * as pulumi from "@pulumi/pulumi";
import { randomUUID } from 'crypto';

const config = new pulumi.Config('databaseCluster');
const gcpConfig = new pulumi.Config('gcp');

const databaseInstance = new gcp.sql.DatabaseInstance(config.require('name'), {
  region: gcpConfig.require('region'),
  name: config.require('name'),
  databaseVersion: config.require('databaseVersion'),
  rootPassword: randomUUID(),
  settings: {
    tier: "db-custom-1-3840", // TODO: use in datacenter config?
  },
  deletionProtection: false
});

export const id = databaseInstance.id;
export const private_host = databaseInstance.privateIpAddress;
export const host = databaseInstance.ipAddresses[0];
export const port = 5432; // TODO: un-hardcode
export const username = databaseInstance.serviceAccountEmailAddress;
export const password = databaseInstance.rootPassword;
// export const database = databaseInstance.database.apply(database => database.toString()); // TODO: assign?
