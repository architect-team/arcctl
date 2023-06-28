# Architect Component Schema - v2

Components are Architect's cloud-agnostic, 100% portable cloud application bundles. The component
framework allows developers to use simple terms to design their cloud applications using a simple,
declarative language. By using a common, infrastructure-agnostic language, developers are able to
better collaborate with peer engineering and operations teams without colliding or slowing each
other down.

This file contains details on how to author [Architect Components](../) using v2 of the Architect
Component Framework. As of now, `v2` is the latest component schema, and it is recommended for use
for all new Architect Components.

## Deployments

One of the main features of Architect Components is the ability to run containerized cloud
applications. In the v2 Component Schema, these workloads are called "deployments". This language
mirrors ArcCtl's own [resource types](../../%40resources/deployment/) as well as [Kubernetes Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
to ensure that developers coming from other tools have an intuitive experience.

Declaring a deployment as part of your component is easy. The only _required_ field is a Docker
`image` that will power the deployment, but it is common to give deployments a human-readable
`description` as well as `environment` variables that will enrich the application at runtime.

```yml
version: v2

deployments:
  my-app:
    description: Description of my app
    image: nginx:latest
    environment:
      LOG_LEVEL: info
```

Whenever the above component is deployed, it will run a single replica of the `my-app` deployment
according to the rules of the [datacenter](../../datacenters/) powering the [environment](../../environments/).

However, the application as it stands won't be listening for any requests from other applications
or users. To learn how to expose the application to other apps, check out the docs on
[services](#services).

### Liveness probes

A common practice when running cloud applications in production-grade environments is to provide
details on how platforms (like kubernetes or ECS) can determine if your application is healthy.
This kind of information is useful to help the platform determine if/when it needs to restart the
application or alert you that something is wrong.

```yml
deployments:
  my-app:
    # ...
    probes:
      liveness:
        type: http
        port: 8080
        path: /healthz
```

### CPU & memory limits

Another piece of information that can be useful for production-grade operations is how much CPU
and memory your application needs in order to be successful. By keeping this number low, developers
can ensure that their application runs in the most cost-effective way.

```yml
deployments:
  my-app:
    # ...
    cpu: 0.5
    memory: 200Mi
```

### Overriding command and entrypoint

Docker images are capable of defining the `CMD` and `ENTRYPOINT` fields right inside the `Dockerfile`,
but sometimes those values aren't quite right for how your application needs to run. You can easily
override those values as part of your deployment definition:

```yml
version: v2

deployments:
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

To learn more about the [`CMD`](https://docs.docker.com/engine/reference/builder/#cmd) and [`ENTRYPOINT`](https://docs.docker.com/engine/reference/builder/#entrypoint) values, consult Docker's Documentation:

https://docs.docker.com/engine/reference/builder/

### Building from source

Having ArcCtl build your docker images for you can be extremely helpful for debugging Components and
creating new test environments before packaging and publishing your code.

To have a deployment powered by your source code, declare an image to be built using the `builds` keyword.

```yml
version: v2

builds:
  my-code:
    context: ./
    dockerfile: Dockerfile.prod

deployments:
  my-app:
    image: ${{ builds.my-code.id }}
```

## Variables

Although Architect Components strive to automate as much configuration as possible, there are still cases where you may want to run your component with manually provided configuration or credentials.
To allow your component to receive manual input, simply declare a variable and specify where that
variable should be injected into your Component:

```yaml
version: v2

variables:
  my-var:
    description: Human-readable description
    default: default-value
    required: false

deployments:
  my-app:
    # ...
    environment:
      VAR_VALUE: ${{ variables.my-var }}
```

## Databases

Another key building block for cloud applications is the database. Databases are critical for stateful
applications to securely and performantly store and query application data.

### Creating databases

To create a database as part of your component, all you have to do is give it a name and `type`. Types are of the format, `<engine>:<version>`. It's also common to give your database a human-readable
`description` so that operations teams can easily see what the database is allocated for.

```yml
version: v2

databases:
  my-db:
    description: Stores data for my app
    type: postgres:13
```

### Integrating databases

Declaring databases is easy enough, but what really makes [Architect Components](../) shine are their
ability to automate the integration between cloud services and resources. Using the schema's expression
syntax, you can easily inject the databases connection string into your application's environment
variables. In doing so, the application will automatically receive the correct value in every
environment it gets deployed into.

If that wasn't enough, Architect also detects when different resources are attempting to connect to the
database and automatically creates unique credentials for each consumer. That means you've effectively
achieved zero-trust security without any additional work!

```yml
# ... contents from above ...

deployments:
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

## Services

### Registering services

```yml
version: v2

deployments:
  my-app:
    # ...

services:
  public:
    deployment: my-app
    port: 8080
  admin:
    deployment: my-app
    port: 8081
    username: user
    password: pass
```

### Integrating services

```yml
version: v2

deployments:
  my-app:
    # ...
    environment:
      SELF_PUBLIC_INTERNAL_ADDR: ${{ services.public.url }}
  second-app:
    # ...
    environment:
      # http://user:pass@host:port/
      FIRST_APP_ADMIN_ADDR: ${{ services.admin.url }}
      
      # you can also inject the individual URL parts
      FIRST_APP_ADMIN_HOST: ${{ services.admin.host }}
      FIRST_APP_ADMIN_PORT: ${{ services.admin.port }}
      # Not all services have basic auth creds
      FIRST_APP_ADMIN_USER: ${{ services.admin.username }}
      FIRST_APP_ADMIN_PASS: ${{ services.admin.password }}

services:
  public:
    deployment: my-app
    port: 8080
  admin:
    deployment: my-app
    port: 8081
    username: user
    password: pass
```

## Ingress rules

### Creating ingress rules

```yml
version: v2

deployments:
  my-app:
    # ...

services:
  public:
    deployment: my-app
    port: 8080
  admin:
    deployment: my-app
    port: 8081

ingresses:
  public:
    service: public
  admin:
    service: admin
    internal: true
```

### Integrating ingress rules

```yml
version: v2

deployments:
  my-app:
    # ...
    environment:
      CORS_WHITELIST: ${{ ingresses.public.url }}

services:
  public:
    deployment: my-app
    port: 8080
  admin:
    deployment: my-app
    port: 8081

ingresses:
  public:
    service: public
  admin:
    service: admin
    internal: true
```

## Component dependencies

### Integrating dependencies

```yml
version: v2

dependencies:
  auth: architect/auth
  smtp: architect/smtp

deployments:
  my-app:
    # ...
    environment:
      SMTP_ADDR: ${{ dependencies.smtp.services.smtp.url }}
      AUTH_ADDR: ${{ dependencies.auth.ingresses.public.url }}
```

### Passing variables

```yml
# architect/auth component
version: v2

variables:
  allowed_return_urls:
    description: URLs that the service can safely redirect to after auth flows
    merge: true

services:
  public:
    # ...

ingresses:
  public:
    # ...
```

```yml
version: v2

dependencies:
  smtp: architect/smtp
  auth:
    component: architect/auth
    variables:
      allowed_return_urls:
        - ${{ ingresses.public.url }}

deployments:
  my-app:
    # ...
    environment:
      SMTP_ADDR: ${{ dependencies.smtp.services.smtp.url }}
      AUTH_ADDR: ${{ dependencies.auth.ingresses.public.url }}
```
