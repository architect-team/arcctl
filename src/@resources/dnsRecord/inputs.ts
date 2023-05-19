export type DnsRecordInputs = {
  dnsZone: string;
  subdomain: string;
  recordType: string;
  content: string;
  ttl?: number;
};

export default DnsRecordInputs;
