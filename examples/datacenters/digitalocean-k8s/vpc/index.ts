import * as digitalocean from "@pulumi/digitalocean";
import * as pulumi from "@pulumi/pulumi";

let config = new pulumi.Config();

export const name = config.get('name')!.replace(/\//g, '-');

const vpc = new digitalocean.Vpc("my-vpc", {
  region: config.get('region')!,
  name,
});

export const id = vpc.id.apply(id => id.toString());
