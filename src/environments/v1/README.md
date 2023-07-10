# Architect Environment Schema - v1

Architect Environment Schemas are packages of runtime configuration for one or more components
that should co-exist in the same environment. Environments are backed by a single datacenter,
and provide a format by which developers can merge their components with one another in a
shared environment.

## Adding components

The most basic feature of the environment schema is to provide a home for components and their
configuration. To add a component to an environment, simply declare the component name and `source`
in the schema file:

```yml
components:
  architect/smtp:
    source: registry.hub.docker.com/mailslurper/mailslurper:latest
```

The key in the `components` dictionary above represents the component name/repo. Other components
in the environment that use a similar name for a dependency will resolve to the declared component.
However unlikely a use-case it may be, this means you can fulfill dependency claims with entirely different
components if you'd like:

```yml
components:
  architect/smtp:
    source: sendgrid/smtp:latest
```

### Scaling rules

Another common set of values environments will provide to components are the number of replicas
of each deployment to run. Obviously the default is one, but you can specify whatever value is
appropriate for the environment:

```yml
components:
  architect/smtp:
    # ...
    deployments:
      mailslurper:
        replicas: 3
      mailslurper-api:
        autoscaling:
          min_replicas: 2
          max_replicas: 4
```

### Ingress configuration

It is common for components to declare [`ingressRules`](../../@resources/ingressRule/) that 
indicate that they wish to be exposed to the outside world. However, components are NOT able
to safely decide on the specifics of each rule because they don't know if those values
will collide with other components in the environment (e.g. two ingresses trying to listen
on `api.my-domain.com`). 

For this reason, common ingress configuration settings (like `path` and `subdomain`) can be
specified in the environment.

```yml
components:
  # Full registry addresses are valid component names
  architect/auth:
    # ...
    ingresses:
      api:
        subdomain: auth
        path: /api
      frontend:
        subdomain: auth
        path: /
      admin:
        subdomain: auth-admin
        internal: true
```

### Re-using values

Do you have a configuration setting that gets re-used in several places inside the
environment schema? You can use the `locals` keyword to declare the value in a single
location to be referened elsewhere in the configuration:

```yaml
# locals allow you to re-use the same value in multiple
# places in your schema file
locals:
  stripe_api_key: xyzpdq

components:
  architect/app1:
    source: architect/app:latest
    secrets:
      stripe_key: ${{ locals.stripe_api_key }}
  
  architect/app2:
    source: architect/app:latest
    secrets:
      stripe_key: ${{ locals.stripe_api_key }}
```

### Running from source

Want to test out a component before publishing it to a remote registry? You can specify
the components live on your local filesystem by using the `file:` prefix on the `source`
value for a component:

```yml
components:
  architect/auth:
    source: file:./component/architect.yml
```
