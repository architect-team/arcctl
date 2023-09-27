import * as digitalocean from "@pulumi/digitalocean";
import * as pulumi from "@pulumi/pulumi";

let config = new pulumi.Config();

const database = new digitalocean.DatabaseCluster("my-database", {
  name: config.get('databaseName')!,
  engine: config.get('databaseType')!,
  version: config.get('databaseVersion')!,
  nodeCount: 1,
  region: config.get('region')!,
  size: 'db-s-1vcpu-2gb',
});

export const id = database.id.apply(id => id.toString());
