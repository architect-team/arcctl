import * as digitalocean from "@pulumi/digitalocean";
import * as pulumi from "@pulumi/pulumi";

let config = new pulumi.Config();

const name = config.require('name').replace(/\//g, '-');
const vpc = new digitalocean.Vpc("my-vpc", {
  region: config.require('region'),
  name,
});

export const id = vpc.id.apply(id => id.toString());
