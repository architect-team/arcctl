import * as gcp from "@pulumi/gcp";

const inputs = process.env.INPUTS;
if (!inputs) {
  throw new Error('Missing configuration. Please provide it via the INPUTS environment variable.');
}

type Config = {
  subdomain: string;
  domain: string;
  type: string;
  value: string;
};

const config: Config = JSON.parse(inputs);

const subdomain = config.subdomain;
const zone = config.domain;

const dnsRecord = new gcp.dns.RecordSet('dns_record', {
  name: `${subdomain}.${zone}.`,
  managedZone: zone.replace('.', '-'),
  type: config.type,
  rrdatas: config.value.split(','),
});

export const id = dnsRecord.id;
