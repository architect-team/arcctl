# Ingress rules

Ingress rules represent configuration settings for how gateways or service meshes should route traffic for a single route.
A single ingress rule can include things like a hostname and path to listen on as well as the name or address of a service
to forward traffic to.

```sh
$ arcctl list ingressRule

$ acctl get ingressRule <id>

$ arcctl create ingressRule

$ arcctl destroy ingressRule
```
