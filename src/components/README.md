# Architect Components

Components are Architect's cloud-agnostic, 100% portable cloud application bundles. The component
framework allows developers to use simple terms to design their cloud applications using a simple,
declarative language. By using a common, infrastructure-agnostic language, developers are able to
better collaborate with peer engineering and operations teams without colliding or slowing each
other down.

## Designing components

Architect Components are designed specifically to aid developers in their pursuit of designing and
their applications. Instead of learning and codifying the infrastructure required by the application
or the pipelines needed to deploy it, developers focus on the things they already know like what
database they need, events they publish, and how to integrate those resources together.

Components use a versioning system to allow the schema to evolve without friction. To learn how to
author a component, pick a schema you'd like to use:

- [v2 (latest)](./v2/)
- [v1](./v1/)

## Building components

Architect Components use the [Open Container Initiatives (OCI)](https://opencontainers.org/)
[Image specification](https://github.com/opencontainers/image-spec) for packaging components and their
corresponding artifacts. By using open specification, Architect components can easily be stored in OCI
supported registries like [Dockerhub](https://hub.docker.com/), [ECR](https://aws.amazon.com/ecr/),
[Artifactory](https://jfrog.com/artifactory/), and many more.

ArcCtl attempts to emulate the way [docker](https://docker.com/) handles image packaging and local image
caching to make it easier to work with images locally. To build an image (but not push it to a registry),
run `arcctl build`:

```sh
$ arcctl build ./architect.yml
Digest: <hash>
```

The "Digest" that gets returned by the command is a abbreviated sha256 of the component contents.
If you were to re-run the build command without making any changes to the architect.yml, you'd get
the same digest.

You can also confirm that arcctl built and stored the component in the local cache by running
`arcctl get component`:

```sh
$ arcctl get component <hash>
```

This command will log the component's yaml contents to the terminal for confirmation.

## Tagging components

Storing components locally is great for debugging and everyday use, but lacks any clear name or
version number that would make it clear what the artifact is. Tagging components helps solve this
problem by giving components a name and version specifier that others can use to refer to it.

Just like with the `build` command, this command is intended to mirror the use of the `docker`
CLI to create and manage images. Feel free to refer to [docker's documentation](https://docs.docker.com/engine/reference/commandline/tag/)
to learn more.

```sh
# Create a tag from a digest
$ arcctl tag e9d4b4d086d3 architect/component:v1

# Create a tag from another tag
$ arcctl tag architect/component:v1 architect/component:latest

# Create a tag that uses a specific registry
$ arcctl tag architect/component:latest registry.dockerhub.com/architect/component:latest

# Create one or more tags automatically from the build command
$ acctl build ./architect.yml -t architect/component:latest -t architect/component:v1
```

## Push/pull components to/from registries

Tagging components doesn't make any network calls, and thus doesn't push artifacts to a remote
registry (even if the tag includes a registry host). To ship your built component to a remote
registry, run `arcctl push`:

```sh
$ arcctl push registry.dockerhub.com/architect/component:latest
```

## Deploying components

Once your component is published to a registry, you can then deploy the component to one
or more [arcctl environments](../environments/). Components can be deployed into ANY
environment and will automatically be enriched to conform to the rules of said environment.

```sh
$ arcctl deploy architect/component:latest --environment staging
```

_Note: You need to run `push` before you can deploy to remote environments, but not for local
ones._

## Creating ephemeral environments

In addition to deploying to existing environments, developers are able to quickly create
[on-demand, ephemeral environments](../environments/README.md#ephemeral-environments) that
are perfect for debugging components and code. When using the `up` command, components will
be run in debug mode, logs from the deployed resources will be automatically streamed to
the terminal, and the environment will automatically clean itself up when the terminal
process is terminated.

```sh
# Create an environment for a single component
$ arcctl up architect/component:latest --datacenter local

# Create an environment that includes two unrelated components
$ arcctl up architect/component:latest architect/second:latest --datacenter local

# Utilize specific versions of components in an environment
$ arcctl up architect/component:latest architect/auth:v1 --datacenter local

# Build components from source and automatically create an environment
$ arcctl up ./architect.yml --datacenter local
```
