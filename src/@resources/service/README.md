# Services

Services are a method for exposing networked applications to other applications within your cloud
environment. At minimum, services are given a unique name and a target deployment to forward traffic
to, and return a URL that can be used to access the underlying application.

```sh
$ arcctl list service

$ acctl get service <id>

$ arcctl create service

$ arcctl destroy service
```
