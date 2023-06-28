# DNS Zones

The DNS is broken up into many different zones. These zones differentiate between distinctly managed areas in the DNS namespace. A DNS zone is a portion of the DNS namespace that is managed by a specific organization or administrator. A DNS zone is an administrative space which allows for more granular control of DNS components, such as authoritative nameservers. The domain name space is a hierarchical tree, with the DNS root domain at the top. A DNS zone starts at a domain within the tree and can also extend down into subdomains so that multiple subdomains can be managed by one entity.

_Source: https://www.cloudflare.com/learning/dns/glossary/dns-zone/_

```sh
$ arcctl list dnsZone

$ acctl get dnsZone <id>

$ arcctl create dnsZone

$ arcctl destroy dnsZone
```
