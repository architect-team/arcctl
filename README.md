<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cdn.architect.io/logo/horizontal-inverted.png"/>
    <source media="(prefers-color-scheme: light)" srcset="https://cdn.architect.io/logo/horizontal.png"/>
    <img width="320" alt="Architect Logo" src="https://cdn.architect.io/logo/horizontal.png"/>
  </picture>
</p>

<p align="center">
  <a href="https://oclif.io"><img src="https://img.shields.io/badge/cli-oclif-brightgreen.svg" alt="oclif" /></a>
  <a href="https://npmjs.org/package/@architect-io/cldctl"><img src="https://img.shields.io/npm/v/@architect-io/cldctl.svg" alt="Version" /></a>
  <a href="https://github.com/architect-team/architect-cldctl/blob/main/package.json"><img src="https://img.shields.io/github/license/architect-team/cldctl.svg" alt="License" /></a>
</p>

<h1 style="text-align: center">
  cldctl - for creating on-demand cloud infrastructure
</h1>

cldctl standardizes the interfaces for common cloud resources like VPCs, managed kubernetes clusters, and more, making it easier for developers to create and manage on-demand cloud infrastructure. With this CLI, you'll be able to `list`, `get`, `create`, or `delete` supported resources from your favorite cloud providers and tools without learning the API calls or language used by each individual provider.

## Prerequisites

Please make sure to install

[ ] [NodeJS](https://nodejs.org/en/)

## Usage

```sh
# Install the CLI
$ npm install -g @architect-io/cldctl

# Register your first provider
$ cldctl add credentials --name my-credentials

# List some resources
$ cldctl list vpc --credentials my-credentials

# Create a resource
$ cldctl create vpc
```

## Cloud Providers

Before you'll be able to interact with any cloud resources, you'll need to register your cloud credentials with cldctl:

```sh
# The CLI will prompt you for available provider types and required credentials
$ cldctl add credentials
```

Scroll down to see more information about how to register each provider. **We highly recommend taking the time to read through our Readme for your desired cloud provider.** While cldctl can help to simplify the managment of resources, each cloud provider has it's own quirks that can still add some complexity to getting started. Our step by step guide can help make sure everything wroks smoothly the first time.

### Supported providers
- [x] [digitalocean](./src/%40providers/digitalocean/)
- [x] [aws](./src/%40providers/aws/)
- [ ] gcp
- [ ] azure

## Resource types

The first reponsibility of this CLI is to define a set of standard schemas for common cloud resources, like VPCs, Regions, managed kubernetes clusters, and more. Below is the current list of supported schemas as well as some insights into future plans for support:

### Supported resources

- [x] [region](./src/%40resources/region/)
- [x] [vpc](./src/%40resources/vpc/)
- [x] [kubernetesCluster](./src/%40resources/kubernetesCluster/)
- [x] [dnsZone](./src/%40resources/dnsZone/)
- [x] [dnsRecord](./src/%40resources/dnsRecord/)
- [x] [database](./src/%40resources/database/)
- [x] [databaseType](./src/%40resources/databaseType/)
- [x] [databaseVersion](./src/%40resources/databaseVersion/)
- [x] [databaseSize](./src/%40resources/databaseSize/)
- [ ] [kubernetesNamespace](./src/%40resources/kubernetesNamespace/)
- [ ] [databaseSchema](./src/%40resources/databaseSchema/)
- [ ] [databaseUser](./src/%40resources/databaseUser/)

### Interacting with resources

```sh
$ cldctl list <resource>
$ cldctl list all
$ cldctl get <resource> <id>
$ cldctl create <resource>
$ cldctl delete <resource> <id>
```
