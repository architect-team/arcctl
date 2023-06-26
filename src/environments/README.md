# ArcCtl Environments

Environments represent running instances of [components](../components/) that
are made available to each other for integration. You likely have environments for
things like `production` or `staging`, but may also create private environments for
integration testing or everyday development.

ArcCtl attempts to automate as much configuration for components as possible, but
there are still cases where owners will want to assign environment-specific rules
and values.

## Creating environments

Before you can create an environment, you'll need a [datacenter](../datacenters/) the
environment can be backed by. To learn more about datacenters, check out the [datacenters docs](../datacenters/).

### Ephemeral environments

Most developer's first exposure to environments is via ephemeral environments –
short lived environments that will automatically clean themselves up when the process
that created the environment is killed. These are perfect for everyday usage and quick
tests of new code changes.

Creating ephemeral environments is simple using the `arcctl up` command. You can specify
one or more [components](../components/) to include in the environment via tag or local path,
and an environment will be created that includes them all:

```sh
$ arcctl up ./api1 architect/auth:latest --datacenter my-datacenter
```

The command above will create an environment with at least two components: one that can be found
at the path `./api1` (which must contain an architect.yml file at minimum), and the other that has
been tagged as `architect/auth:latest`. The environment will also be backed by the `my-datacenter`
datacenter and will follow the rules of that datacenter for provisioning.

In addition to the component(s) cited, arcctl will also deploy any dependencies of the cited components –
even if you don't specify them explicitly. By default, all components deployed implicitly as dependencies
will attempt to deploy the `latest` tag of the component. You can specify other tags by including the
component explicitly in the command:

```sh
$ arcctl up architect/auth:v1 --datacenter my-datacenter
```

The `up` command by default turns on `debug` mode for components to toggle features designed for local
development and rapid contribution. To turn this off, use the `--debug` flag:

```sh
$ arcctl up architect/auth:v1 --datacenter my-datacenter --debug false
```

_To learn more about components and dependencies, check out the [component documentation](../components/)._

### Permament environments

Permanent environments are long-running environments that will be constantly updated and contributed to.
These environments persist beyond the lifecycle of the environment creation CLI process and will be cleaned
up manually (or never).

You can create an environment using `arcctl create environment`. The example below creates an environment
called "production" on a datacenter called "my-datacenter":

```sh
$ arcctl create environment production --datacenter my-datacenter
```

_Note: Creating even empty environments may require the creation of cloud resources
depending on what your datacenter configuration requires._

You can also create environments and immediately load them with contents by providing
an environment configuration as an argument for the create command:

```sh
$ arcctl create environment production ./environment.yml --datacenter my-datacenter
```

## Updating environments

### Using the deploy command

The most common way for developers to provide targeted updates to existing environments is through
the `arcctl deploy` command. This command allows developers to deploy a single component into an
existing environment and pass in a few key configuration elements.

```sh
$ arcctl deploy architect/auth:latest --environment production
```

One example of configuration that can be passed in the deploy command is ingress subdomains. Domain
names in the same environment often use the same base URL any naming conventions for exposing
ingress rules to the outside world, but that means that ingress names for components can
collide with one another when they land in the same environment (e.g. two components with an ingress
named "api").

To resolve these conflicts, you can specify a subdomain manually with the `--ingress, -i` flag:

```sh
$ arcctl deploy architect/auth:latest --environment production --ingress api:auth-api frontend:auth
```

The command above will assign the subdomains `auth-api` and `auth` to the `api` and `frontend` ingress
rules respectively inside the `architect/auth` component. Note that the rest of the URL for the [`ingressRules`](../%40resources/ingressRule/)
is expected to be provided by the datacenter you deploy to.

_The deploy command is basically a wrapper on top of the `arcctl environment update` command seen below.
It mutates the underlying environment configuration and then re-applies the changes. If you don't see
a flag to configure what you need, check out the environment configuration file details below._

### From a configuration file

Environments can be updated at any time using the `arcctl update environment` command. The update
command will ensure the environment matches the provided configuration. That sometimes means creating
new resources, updating existing resources, destroying resources that are no longer needed, or a little
bit of everything.

```sh
$ arcctl update environment production ./environment.yml
```

You can also return the environmnent to an empty state by simply NOT providing an environment configuration
file:

```sh
$ arcctl update environment production
```

## Cleaning up environments

If you want to completely remove the environment and all its resources, you can easily do so with the
`arcctl destroy environment` command:

```sh
$ arcctl destroy environment production
```

## The environment configuration file

ArcCtl uses versioning to allow its core schemas to grow and evolve. To learn how to author an
environment configuration file, select a schema version below:

- [v1 (latest)](./v1/)
