# Local datacenter

This datacenter template includes everything you need to run Architect
Components locally. It uses docker and the local filesystem to run workloads and
store variables/secrets respectively. It exposes Component ingresses via Traeik
and uses [nip.io] to create realistic DNS records for better application
testing.

## Variables

- `secretsPath` - Path on the local filesystem to store application secrets in

## Datacenter resources

The following resources will be created immediately when your datacenter gets
created. These resources will be shared by all environments this datacenter
powers:

- A folder in the specified secrets directory used for storing Traefik
  configuration
- A instance of Traefik running with docker that uses the folder above to source
  configuration
- A postgres container running with docker that will be used for all component
  databases

## Environment resources

_This datacenter creates no resources when an empty environment is created._

## Supported application resources

The following application resources are supported by this datacenter:

- `deployment` - Application workloads will be run with docker
- `service` - Component services will be registered with the datacenter traefik
  instance
- `secret` - Variables and dynamic application outputs will be stored on the
  filesystem in the folder specified in the datacenter variables
- `ingressRule` - Component ingresses will be registered with the datacenter
  traefik instance
- `database` - Component databases will be run with docker. Each component
  database will get its own database instance.
