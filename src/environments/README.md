# Cloud environments

## Example

```yaml
components:
  architect/frontend:
    source: architect/frontend:latest
```

## Registering environments

```sh
$ cldctl environment apply ./environment.yml --name my-env --datacenter my-datacenter
```