# Deployments

Deployments represent a request to run some number of instances of an application. You
describe a desired state of your application in a deployment, and one of ArcCtl's
supported providers will manage the lifecycle of the application and ensure that
the desired state is maintained. For those of you familiar with [Kubernetes Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/),
this is the same concept.

```sh
$ arcctl list deployment

$ acctl get deployment <id>

$ arcctl create deployment

$ arcctl destroy deployment
```
