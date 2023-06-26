# v1 datacenter schema

The v1 datacenter schema is designed to allow operators to control resources in three
different scopes:

- Datacenter-scoped resources
- Environment-scoped resources
- Application-scoped resources

By combining these three scopes, operators can create robust datacenter templates that
can be used to host and integrate virtually any application in any style of cloud
environment.

## Datacenter resources

Datacenter scoped [resources](../../%40resources/) are those which get created and destroyed with the lifecycle of
the datacenter itself. This scoping allows operators to create cloud resources that will be
shared across all environments and applications hosted by the datacenter. This can be VPCs,
kubernetes clusters, API gateways, and more utilities that you'd want to share across
environments.

```yaml
resources:
  vpc:
    type: vpc
    name: arcctl-datacenter
    account: ${{ variables.doAccount }}
    region: ${{ variables.region }}
```

Every resource must declare a `type` that matches one of the arcctl [resource types](../../%40resources/)
as well as an [`account`](../../%40providers/) capable of creating said type of resource. Once declared, the outputs of said
resource type can be referenced elsewhere in the datacenter schema using the expression syntax,
`${{ resources.<resource-key>.<output-key> }}`.

```yml
resources:
  vpc:
    # ...same as above...

  cluster:
    type: kubernetesCluster
    name: arcctl-datacenter
    kubernetesVersion: 1.26.5-do.0
    account: ${{ variables.doAccount }}
    region: ${{ variables.region }}
    vpc: ${{ resources.vpc.id }}
    nodePools:
      - name: pool1
        count: 3
        nodeSize: s-1vcpu-2gb
```

## Datacenter accounts

In addition to creating arcctl resources, datacenters can also register new cloud accounts
with one of the supported providers automatically. This can help setup complex sequences
that allow you to create resources within newly created cloud accounts without additional
steps.

```yml
accounts:
  cluster:
    name: do-personal-cluster
    provider: kubernetes
    credentials:
      configPath: ${{ resources.cluster.configPath }}
```

Like resources and variables, you can then reference this new account elsewhere with
the expression syntax, `${{ accounts.<account-key>.id }}`.

## Environment specification

The environment specification is where we define resources and rules for how each
environment will behave within the datacenter. Everything defined in the environment
section of the schema will apply to each individual environment within the datacenter.

```yml
environment:
  resources:
    # ...
  accounts:
    # ...
  hooks:
    # ...
```

### Environment resources

Like with the root scope, arcctl resources can be declared within the environment
specification as well. When declared here, one of each resource will be created for
each environment within the datacenter.

```yml
environment:
  resources:
    namespace:
      type: namespace
      # The resources can point to datacenter-level resources
      account: ${{ accounts.cluster.id }}
      # The environment name can be injected dynamically
      name: ${{ environment.name }}
    nginx-ingress-controller:
      type: helmChart
      name: ${{ environment.name }}-ingress-nginx
      account: ${{ accounts.cluster.id }}
      # Environment resources can point to each other
      namespace: ${{ environment.resources.namespace.id }}
      repository: https://kubernetes.github.io/ingress-nginx
      chart: ingress-nginx
```

### Environment accounts

Also as with the root scope, new arcctl accounts can be registered for each enviroment
that broker access to environment-scoped resources:

```yml
environment:
  resources:
    pg:
      type: database
      account: ${{ variables.account }}
      name: ${{ environment.name }}-pg
      databaseType: postgres
      databaseVersion: '13'
      databaseSize: n/a
      vpc: n/a
      region: n/a
  
  accounts:
    pg:
      name: ${{ environment.name }}-postgres-db
      provider: postgres
      credentials:
        host: ${{ environment.resources.pg.host }}
        port: ${{ environment.resources.pg.port }}
        username: ${{ environment.resources.pg.username }}
        password: ${{ environment.resources.pg.password }}
        database: architect
```

### Resource hooks

The last, and possibly most interesting part of the datacenter spec is the ability to define `hooks`.
Hooks are rules for how application resources should be modified when they land within the datacenter.

These hooks allow operators to assign rules for how ALL resources should behave in the environment and
are the main feature that enables operators to retain control of the environment without compromising
developer self-service.

```yaml
hooks:
  # Hooks can define "when" clauses that indicate what fields
  # must match for the hook to apply
  - when:
      type: secret
    account: local
  - when:
      type: databaseSchema
      databaseType: postgres
    # Hooks can define inline resources that should be created
    # whenever an application resource matches the hook
    resources:
      db:
        type: database
        account: ${{ variables.doAccount }}
        # Inline resources can reference fields from the application 
        # resource node like .id, .inputs.*, and .outputs.*
        name: ${{ this.id }}
        databaseVersion: ${{ this.inputs.databaseVersion }}
        databaseSize: db-s-1vcpu-1gb
        databaseType: ${{ this.inputs.databaseType }}
        vpc: ${{ resources.vpc.id }}
        region: ${{ variables.region }}
    account: ${{ variables.doAccount }}
    # The matching resource can also refer to the inline resource to populate
    # its configuration
    database: ${{ this.resources.db.id }}
  - when:
      type: ingressRule
    resources:
      dnsRecord:
        type: dnsRecord
        account: ${{ variables.doAccount }}
        dnsZone: ${{ variables.dnsZone }}
        subdomain: ${{ this.inputs.subdomain }}
        recordType: A
        content: ${{ this.outputs.loadBalancerHostname }}
    registry: nginx
    namespace: ${{ environment.resources.namespace.id }}
    dnsZone: ${{ variables.dnsZone }}
  # Application results will be mutated by all matching rules UNTIL
  # an `account` is set.
  - account: ${{ accounts.cluster.id }}
    namespace: ${{ environment.resources.namespace.id }}
```

## Variables

Though most of each datacenter schema is self-contained, there are some cases where datacenters
templates need additional input from users before they can be used to power a datacenter. These
inputs are called variables:

```yml
variables:
  account:
    # Variables can be arcctl resources
    type: arcctlAccount
    description: The DigitalOcean account used to power the environment
    provider: digitalocean
  region:
    type: region
    name: Region to host resources in
    account: ${{ variables.account }}
```

Declared variables can be referenced anywhere else in the datacenter template that you'd like
using the expression syntax, `${{ variables.<variable-name> }}`.

In addition to [arcctl resources](../../%40resources/), variables can also be `string`, `number`, and `boolean` types.
