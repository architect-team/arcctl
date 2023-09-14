import * as digitalocean from "@pulumi/digitalocean";
import * as pulumi from "@pulumi/pulumi";

let config = new pulumi.Config();

process.env["DIGITALOCEAN_TOKEN"] = config.get('token');

const vpc = new digitalocean.Vpc("my-vpc", {
  region: config.get('region')!,
  name: config.get('name'),
});

export const id = vpc.id.apply(id => id.toString());
