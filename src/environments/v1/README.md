# v1 environment schema

```yaml
locals:
  stripe_api_key: xyzpdq

components:
  architect/smtp:
    source: registry.hub.docker.com/mailslurper/mailslurper:latest
    deployments:
      mailslurper:
        replicas: 3

  architect/auth:
    source: architect/auth:v2
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
  
  architect/app1:
    source: architect/app:latest
    secrets:
      stripe_key: ${{ locals.stripe_api_key }}
  
  architect/app2:
    source: architect/app:latest
    secrets:
      stripe_key: ${{ locals.stripe_api_key }}

  architect/app-debug:
    source: file:./component/architect.yml
```
