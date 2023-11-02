import * as digitalocean from "@pulumi/digitalocean";
import * as pulumi from "@pulumi/pulumi";

let config = new pulumi.Config();

const domain = digitalocean.getDomainOutput({
  name: config.require('domain')
});

const record = new digitalocean.DnsRecord('dns-record', {
  domain: domain.id,
  type: config.require('type'),
  name: config.require('subdomain'),
  value: config.require('value'),
});

export const id = record.id.apply(id => id.toString());
