import * as gcp from "@pulumi/gcp";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config('database');
const gcpConfig = new pulumi.Config('gcp');

const database = new gcp.sql.Database(config.name, { 
  name: `db-${config.require('name')}`.replace(/\//g, '-'),
  instance: config.require('cluster_id') 
});

export const name = database.name;
