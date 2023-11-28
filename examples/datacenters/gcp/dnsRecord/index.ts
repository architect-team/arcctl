import * as gcp from "@pulumi/gcp";
import * as pulumi from "@pulumi/pulumi";

let config = new pulumi.Config('dnsRecord');

const subdomain = config.require('subdomain');
const zone = config.require('domain');

const dnsRecord = new gcp.dns.RecordSet(config.require('domain'), {
  name: `${subdomain}.${zone}.`,
  managedZone: zone.replace('.', '-'),
  type: config.require('type'),
  rrdatas: config.require('value').split(','),
});

export const id = dnsRecord.id;
