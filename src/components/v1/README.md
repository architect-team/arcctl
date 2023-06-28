# Architect Component Schema - v1

## Services

```yml
services:
  my-app:
    image: nginx:latest
    environment:
      LOG_LEVEL: info
```

### Building from source

```yml
services:
  my-app:
    build:
      context: ./
      dockerfile: Dockerfile.prod
```

### Exposing interfaces

```yml
services:
  my-app:
    image: nginx:latest
    interfaces:
      main: 8080
      secondary:
        port: 8081
```

#### Integrating interfaces

```yml
services:
  my-app:
    image: nginx:latest
    interfaces:
      main: 8080
      secondary:
        port: 8081
  second-app:
    image: nginx:latest
    environment:
      MAIN_ADDR: ${{ services.my-app.interfaces.main.url }}
      SECONDARY_ADDR: ${{ services.my-app.interfaces.secondary.url }}
```

#### Ingress rules

```yml
services:
  my-app:
    image: nginx:latest
    interfaces:
      main:
        port: 8081
        ingress:
          subdomain: app
  second-app:
    image: nginx:latest
    environment:
      MAIN_ADDR: ${{ services.my-app.interfaces.main.ingress.url }}
```

### Liveness probes

### CPU & memory limits

### Command and entrypoint

## Variables

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

### Creating databases

```yml
databases:
  my-db:
    description: Stores data for my app
    type: postgres:13
```

### Integrating databases

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

### Integrating dependencies

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

```yml
# architect/auth component
variables:
  allowed_return_urls:
    description: URLs that the service can safely redirect to after auth flows
    merge: true
```

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
