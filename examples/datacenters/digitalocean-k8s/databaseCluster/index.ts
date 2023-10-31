import * as digitalocean from "@pulumi/digitalocean";
import * as pulumi from "@pulumi/pulumi";

let config = new pulumi.Config();

const cluster = new digitalocean.DatabaseCluster("cluster", {
  name: config.require('name'),
  engine: config.require('databaseType'),
  version: config.require('databaseVersion'),
  nodeCount: config.getNumber('count') || 1,
  region: config.require('region'),
  size: config.get('size') || 'db-s-1vcpu-2gb',
  privateNetworkUuid: config.get('vpcId'),
});

export const id = cluster.id.apply(id => id.toString());
export const private_host = cluster.privateHost.apply(private_host => private_host.toString());
export const host = cluster.host.apply(host => host.toString());
export const port = cluster.port.apply(port => port.toString());
export const username = cluster.user.apply(user => user.toString());
export const password = cluster.password.apply(password => password.toString());
export const database = cluster.database.apply(database => database.toString());
