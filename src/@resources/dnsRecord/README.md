# DNS records

DNS records (aka zone files) are instructions that live in authoritative DNS servers and provide information about a domain including what IP address is associated with that domain and how to handle requests for that domain. These records consist of a series of text files written in what is known as DNS syntax. DNS syntax is just a string of characters used as commands that tell the DNS server what to do. All DNS records also have a ‘TTL’, which stands for time-to-live, and indicates how often a DNS server will refresh that record.

_Source: https://www.cloudflare.com/learning/dns/dns-records/_

```sh
$ arcctl list dnsRecord

$ acctl get dnsRecord <id>

$ arcctl create dnsRecord

$ arcctl destroy dnsRecord
```
