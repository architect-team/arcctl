<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cdn.architect.io/logo/horizontal-inverted.png"/>
    <source media="(prefers-color-scheme: light)" srcset="https://cdn.architect.io/logo/horizontal.png"/>
    <img width="320" alt="Architect Logo" src="https://cdn.architect.io/logo/horizontal.png"/>
  </picture>
</p>

<p align="center">
  <a href="https://oclif.io"><img src="https://img.shields.io/badge/cli-oclif-brightgreen.svg" alt="oclif" /></a>
  <a href="https://npmjs.org/package/@architect-io/arcctl"><img src="https://img.shields.io/npm/v/@architect-io/arcctl.svg" alt="Version" /></a>
  <a href="https://github.com/architect-team/arcctl/blob/main/package.json"><img src="https://img.shields.io/github/license/architect-team/arcctl.svg" alt="License" /></a>
</p>

<h1 style="text-align: center">
  arcctl - for creating on-demand cloud infrastructure
</h1>

arcctl standardizes the interfaces for common cloud resources like VPCs, managed kubernetes clusters, and more, making it easier for developers to create and manage on-demand cloud infrastructure. With this CLI, you'll be able to `list`, `get`, `create`, or `delete` supported resources from your favorite cloud providers and tools without learning the API calls or language used by each individual provider.

## Prerequisites

Please make sure to install

[ ] [NodeJS](https://nodejs.org/en/)

## Usage

```sh
# Install the CLI
$ npm install -g @architect-io/arcctl

# Register your first provider
$ arcctl add account --name my-credentials

# List some resources
$ arcctl list vpc --credentials my-credentials

# Create a resource
$ arcctl create vpc
```

## Cloud Providers

Before you'll be able to interact with any cloud resources, you'll need to register your cloud credentials with arcctl:

```sh
# The CLI will prompt you for available provider types and required credentials
$ arcctl add account
```

Scroll down to see more information about how to register each provider. **We highly recommend taking the time to read through our Readme for your desired cloud provider.** While arcctl can help to simplify the managment of resources, each cloud provider has it's own quirks that can still add some complexity to getting started. Our step by step guide can help make sure everything wroks smoothly the first time.

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
$ arcctl list <resource>
$ arcctl list all
$ arcctl get <resource> <id>
$ arcctl create <resource>
$ arcctl delete <resource> <id>
```

## Remote State

ArcCtl uses persisted state to keep track of your accounts, datacenters and environments. These statefiles represent all of your cloud resources. By default these statefiles are kept on your local machine. Though, if you want to share these resources with multiple people across machines, then you will need to use a remote state. Any provider that supports a secret resource type, can be used as a remote backend.

To configure a remote backend you can run the command, which will run you through creating an account.
```
$ arcctl set state.backend
```

To use arcctl in CI flows you can automate the configuration process. The following is an example of using DigitalOcean Spaces.
```
$ arcctl set secretAccount --cred accessKeyId=myAccessKeyId --cred secretAccessKey=mySecretAccessKey --cred endpoint=https://nyc3.digitaloceanspaces.com --cred region=nyc3 --provider s3 --namespace=mybucket
```

### Managed Secrets

Once you configure a new backend, ArcCtl will use that to store any stateful information from the commands you run. At the moment we store 3 secrets.

| Name         | Description                                                                                                               |
|--------------|---------------------------------------------------------------------------------------------------------------------------|
| providers    | A list of all accounts that have been added either through `arcctl add account` or dynamically through resource creation. |
| datacenters  | A list of all managed datacenters and their current state.                                                                |
| environments | A list of all managed environments and their current state.

These secrets contain senesitive information such as account credentials and terraform state files, so it is highly recommended to restrict who has access to these secrets.
