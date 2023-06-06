# arcctl - Digitalocean Provider

## Getting started

#### Generate token

Navigate to the [Api Page](https://cloud.digitalocean.com/account/api/tokens) on the Digitial Ocean dashboard and click `Generate New Token`. Enter a useful name, set `Expiration` to `No expiry`, and click the `Generate Token` button.

![Screenshot of Digitial Ocean token creattion page](../../../docs/static/do-token.png)

Once the token is generated it will appear in the list of keys. Copy the token as once you leave this page the token will not be visible again. You’ll use this token to register your Digital Ocean provider.

## Supported resources

- [x] region (list, get)
- [x] vpc (list, get, create, delete)
- [x] nodeSize (list, get)
- [x] kubernetesVersion (list, get)
- [x] kubernetesCluster (list, get, create, delete)
- [x] dnsZone (list, get, create, delete)
- [x] dnsRecord (list, get, create, delete)
- [x] database (list, get, create, delete)
- [x] databaseType (list, get)
- [x] databaseVersion (list, get)
- [x] databaseSize (list, get)
