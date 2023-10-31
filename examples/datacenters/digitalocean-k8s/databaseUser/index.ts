import * as digitalocean from "@pulumi/digitalocean";
import * as pulumi from "@pulumi/pulumi";

let config = new pulumi.Config();

const user = new digitalocean.DatabaseUser("user", {
  clusterId: config.require("cluster_id"),
  name: config.require("name"),
});

export const id = user.id.apply(id => id.toString());
export const username = user.name.apply(username => username.toString());
export const password = user.password.apply(password => password.toString());
