# Cloud environments

## Example

```yaml
components:
  architect/frontend:
    source: architect/frontend:latest
```

## Registering environments

```sh
$ arcctl environment apply ./environment.yml --name my-env --datacenter my-datacenter
```