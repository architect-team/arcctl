# Architect Component Schema - v2

## Deployments

```yml
version: v2

deployments:
  my-app:
    description: Description of my app
    image: nginx:latest
    environment:
      LOG_LEVEL: info
```

### Liveness probes

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

```yml
deployments:
  my-app:
    # ...
    cpu: 0.5
    memory: 200Mi
```

## Building docker images

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

## Overriding command and entrypoint

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

## Databases

### Creating databases

```yml
version: v2

databases:
  my-db:
    description: Stores data for my app
    type: postgres:13
```

### Integrating databases

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

services:
  public:
    # ...

ingresses:
  public:
    # ...
```
