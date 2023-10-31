# AWS/Lambda datacenter

This datacenter template includes everything you need to run Architect
Components using AWS Lambda functions. It creates a private Route53 zone for
services, a public one for ingress rules, launches all deployments on Lambda,
and creates a single RDS cluster for each database type to be used by all
components in the datacenter.

## Variables

- `region` - Region to create resources in
- `publicDomain` - The base domain name that should be used for external DNS
  records
- `privateDomain` - The base domain name that should be used for internal DNS
  records

## Datacenter resources

The following resources will be created immediately when your datacenter gets
created. These resources will be shared by all environments this datacenter
powers:

- An AWS VPC where all the database resources will reside

## Environment resources

The following resources will be created for each environment you create in this
datacenter:

- A DNS zone for the environment that matches `<environment>`.`<publicDomain>`
  where `<environment>` is the environment name and `<publicDomain>` is the
  domain name specified in the datacenter variables.
- A DNS zone for the environment that matches `<environment>`.`<privateDomain>`
  where `<environment>` is the environment name and `<privateDomain>` is the
  domain name specified in the datacenter variables.

## Supported application resources

The following application resources are supported by this datacenter:

- `deployment` - Application workloads will be run on AWS Lambda
- `service` - Component services will become Route53 records on the private DNS
  zone created by the environment
- `secret` - Variables and dynamic application outputs will be stored as Secrets
  using AWS Secret Manager
- `ingressRule` - Component ingresses will become Route53 records on the public
  DNS zone created by the environment
- `database` - Component databases will be run via RDS. Databases will share a
  cluster of the same databaseType using native database isolation to avoid
  collisions.
