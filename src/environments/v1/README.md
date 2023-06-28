# v1 environment schema

```yaml
# locals allow you to re-use the same value in multiple
# places in your schema file
locals:
  stripe_api_key: xyzpdq

# Declare which components should exist and how they should
# be configured
components:
  # Components resolve dependencies by matching against
  # this root key
  architect/smtp:
    # This is how you specify the registry/tag where the
    # component can be found
    source: registry.hub.docker.com/mailslurper/mailslurper:latest
    deployments:
      mailslurper:
        replicas: 3

  # Full registry addresses are valid component names
  registry.hub.docker.com/architect/auth:
    source: registry.hub.docker.com/architect/auth:v2
    # Ingress rules can be configured with unique tuples
    # of subdomain/path, but cannot collide with other
    # combinations in the environment
    ingresses:
      api:
        subdomain: auth
        path: /api
      frontend:
        subdomain: auth
        path: /
      admin:
        subdomain: auth-admin
        # Ingresses can also be flagged as internal so the
        # datacenter can mount it to private gateways
        internal: true
  
  architect/app1:
    source: architect/app:latest
    secrets:
      stripe_key: ${{ locals.stripe_api_key }}
  
  architect/app2:
    source: architect/app:latest
    secrets:
      stripe_key: ${{ locals.stripe_api_key }}

  architect/app-debug:
    # Components can also be sourced from the local 
    # filesystem
    source: file:./component/architect.yml
```
