# Architect Component Schema - v1

Components are Architect's cloud-agnostic, 100% portable cloud application bundles. The component
framework allows developers to use simple terms to design their cloud applications using a simple,
declarative language. By using a common, infrastructure-agnostic language, developers are able to
better collaborate with peer engineering and operations teams without colliding or slowing each
other down.

This file contains details on how to author [Architect Components](../) using v1 of the Architect
Component Framework. As of now, [`v2`](../v2/) is the latest schema. We'd recommend you check out
the [`v2` schema documentation](../v2/) for new components.

## Services

One of the main features of Architect Components is the ability to run containerized cloud
applications. In the v2 Component Schema, these workloads are called "services".

Declaring a service as part of your component is easy. The only _required_ field is a Docker `image`
that will power the service, but it is common to give services `environment` variables that will
enrich the application at runtime.

```yml
name: my-component

services:
  my-app:
    image: nginx:latest
    environment:
      LOG_LEVEL: info
```

Whenever the above component is deployed, it will run a single replica of the `my-app` deployment
according to the rules of the [datacenter](../../datacenters/) powering the [environment](../../environments/).

However, the application as it stands won't be listening for any requests from other applications
or users. To learn how to expose the application to other apps, check out the docs on
[exposing interfaces](#exposing-interfaces).

### Building from source

Having arcctl build your docker images for you can be extremely helpful for debugging Components and
creating new test environments before packaging and publishing your code. To have a deployment
powered by your source code, declare an image to be built using the `build` keyword as part of your
service.

```yml
services:
  my-app:
    build:
      context: ./
      dockerfile: Dockerfile.prod
```

### Exposing interfaces

By default, services won't be listening for any requests from other applications. To expose the
service to others, all you have to do is declare `interfaces` for your service.

```yml
services:
  my-app:
    image: nginx:latest
    interfaces:
      # Interfaces support a short-hand syntax that just takes the listening port
      main: 8080
      secondary:
        protocol: http
        port: 8081
```

#### Integrating interfaces

Once interfaces have been declared, they can be easily integrated into other services using
Architect's expression syntax:

```yml
services:
  my-app:
    image: nginx:latest
    interfaces:
      main: 8080
      secondary:
        protocol: http
        port: 8081
        username: user
        password: pass
  second-app:
    image: nginx:latest
    environment:
      # http://host:port
      MAIN_ADDR: ${{ services.my-app.interfaces.main.url }}

      # http://user:pass@host:port
      SECONDARY_ADDR: ${{ services.my-app.interfaces.secondary.url }}

      # You can also inject the individual URL parts
      MAIN_PROTOCOL: ${{ services.my-app.interfaces.main.protocol }}
      MAIN_HOST: ${{ services.my-app.interfaces.main.host }}
      MAIN_PORT: ${{ services.my-app.interfaces.main.port }}
      MAIN_USER: ${{ services.my-app.interfaces.main.username }}
      MAIN_PASS: ${{ services.my-app.interfaces.main.password }}
```

#### Ingress rules

Declaring service interfaces by default will only expose the services internally. If you want
to expose your service outside the cloud environment for external users or applications, you'll
need to specify `ingress` rules for the interface.

```yml
services:
  my-app:
    image: nginx:latest
    interfaces:
      main:
        port: 8081
        # Ingress rules can be attached directly to your interface. Values can be overwritten by
        # environments as needed
        ingress:
          subdomain: app
  second-app:
    image: nginx:latest
    environment:
      # Applications can also inject the ingress URL which can be helpful for client-side access
      MAIN_ADDR: ${{ services.my-app.interfaces.main.ingress.url }}
```

### Liveness probes

A common practice when running cloud applications in production-grade environments is to provide
details on how platforms (like kubernetes or ECS) can determine if your application is healthy.
This kind of information is useful to help the platform determine if/when it needs to restart the
application or alert you that something is wrong.

```yml
services:
  my-app:
    # ...
    liveness_probe:
      port: 8080
      path: /healthz
```

### CPU & memory limits

Another piece of information that can be useful for production-grade operations is how much CPU
and memory your application needs in order to be successful. By keeping this number low, developers
can ensure that their application runs in the most cost-effective way.

```yml
services:
  my-app:
    # ...
    cpu: 0.5
    memory: 200Mi
```

### Overriding command and entrypoint

Docker images are capable of defining the `CMD` and `ENTRYPOINT` fields right inside the
`Dockerfile`, but sometimes those values aren't quite right for how your application needs to run.
You can easily override those values as part of your deployment definition:

```yml
services:
  my-app:
    # ...
    entrypoint: [""]
    command:
      - sh
      - -c
      - |
        sleep 100
        npm start
```

## Variables

Although Architect Components strive to automate as much configuration as possible, there are still
cases where you may want to run your component with manually provided configuration or credentials.
To allow your component to receive manual input, simply declare a variable and specify where that
variable should be injected into your Component:

```yaml
variables:
  my-var:
    description: Human-readable description
    default: default-value
    required: false

services:
  my-app:
    # ...
    environment:
      VAR_VALUE: ${{ variables.my-var }}
```

Variables has two legacy aliases: `parameters` and `secrets`.

## Databases

Another key building block for cloud applications is the database. Databases are critical for
stateful applications to securely and performantly store and query application data.

### Creating databases

To create a database as part of your component, all you have to do is give it a name and `type`.
Types are of the format, `<engine>:<version>`. It's also common to give your database a
human-readable `description` so that operations teams can easily see what the database is
allocated for.

```yml
databases:
  my-db:
    description: Stores data for my app
    type: postgres:13
```

### Integrating databases

Declaring databases is easy enough, but what really makes [Architect Components](../) shine are their
ability to automate the integration between cloud services and resources. Using the schema's
expression syntax, you can easily inject the databases connection string into your application's
environment variables. In doing so, the application will automatically receive the correct value in
every environment it gets deployed into.

If that wasn't enough, Architect also detects when different resources are attempting to connect to
the database and automatically creates unique credentials for each consumer. That means you've
effectively achieved zero-trust security without any additional work!

```yml
databases:
  my-db:
    description: Stores data for my app
    type: postgres:13

services:
  my-app:
    image: nginx:latest
    environment:
      # postgresql://user:pass@host:port/db
      DB_ADDR: ${{ databases.my-db.url }}

      # You can also inject URL parts individually
      DB_USER: ${{ databases.my-db.user }}
      DB_PASS: ${{ databases.my-db.pass }}
      DB_HOST: ${{ databases.my-db.host }}
      DB_PORT: ${{ databases.my-db.port }}
      DB_NAME: ${{ databases.my-db.database }}
```

## Component dependencies

One of the more advanced features of Architect's Component framework is the ability for components to
extend one another as "dependencies". Like libraries and packages, APIs can benefit from the ability
to seamlessly integrate with one another, so we wanted to bring this capability to components.

If you're familiar with [Terraform](https://www.terraform.io/) you've probably seen something that
looks a bit similar with [modules](https://developer.hashicorp.com/terraform/language/modules), but
unlike modules, Architect dependencies will be shared by all components in the same environment that
refer to the same dependency. This is more desirable when teams build internal services like "auth"
or "recommendations" so that there is only one instance of the dependent component that's run by the
team that owns it.

### Integrating dependencies

Declaring dependencies for your component is as easy as using the `dependencies` keyword as shown
below. In the v1 schema, the key is the repository where you expect to find the component and the
value is the tag that should be used unless otherwise specified.

Once declared, you can inject the dependency's [services](#services), [ingresses](#ingress-rules), or
[databases](#databases) as if they were part of your own component. Architect will continue to
generate zero-trust configuration settings even when connecting across components.

```yml
version: v2

dependencies:
  architect/auth: latest
  architect/smtp: latest

deployments:
  my-app:
    # ...
    environment:
      SMTP_ADDR: ${{ dependencies.architect/smtp.services.smtp.url }}
      AUTH_ADDR: ${{ dependencies.architect/auth.ingresses.public.url }}
```

### Passing variables

There are some cases where dependencies need to collect information from the components that consume
them. Usually this is for whitelisting URLs or otherwise configuring security rules.

Passing values can only be done for components and variables that declare the `merge` field as true.
This tells Architect to merge the results from the environment and all upstream components into an
array of values the component can use to configure itself.

```yml
# architect/auth component
variables:
  allowed_return_urls:
    description: URLs that the service can safely redirect to after auth flows
    merge: true
```

When upstream components cite the component as a dependency, they can provide their own values to
these mergeable variables that will be integrated with the other values:

```yml
dependencies:
  architect/smtp: latest
  architect/auth:
    component: latest
    variables:
      allowed_return_urls:
        - ${{ ingresses.public.url }}

services:
  my-app:
    # ...
    environment:
      SMTP_ADDR: ${{ dependencies.smtp.services.smtp.url }}
      AUTH_ADDR: ${{ dependencies.auth.ingresses.public.url }}
```
