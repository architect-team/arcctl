import * as pulumi from "@pulumi/pulumi";
import * as digitalocean from "@pulumi/digitalocean";

let config = new pulumi.Config();

const database = new digitalocean.DatabaseDb("database", {
  clusterId: config.require("cluster_id"),
  name: config.require("name").replace(/\//g, '--'),
});

export const name = database.name.apply(name => name.toString());