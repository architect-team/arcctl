import * as gcp from "@pulumi/gcp";
import * as pulumi from "@pulumi/pulumi";

let config = new pulumi.Config('dnsRecord');

const dnsRecord = new gcp.dns.RecordSet(config.require('domain'), {
  name: config.require('subdomain'),
  managedZone: config.require('domain'),
  type: config.require('type'),
  rrdatas: config.require('value').split(','), // TODO: check
});

export const id = dnsRecord.id;
