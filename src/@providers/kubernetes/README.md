# ArcCtl - Kubernetes Provider

Kubernetes is an open source container orchestration engine for automating deployment, scaling, and management of containerized applications. The open source project is hosted by the Cloud Native Computing Foundation (CNCF).

[View the kubernetes documentation](https://kubernetes.io/)

The arcctl kubernetes provider brokers access to kubernetes clusters to help
developers deploy cloud resources to kubernetes. You can register accounts for
more than one kubernetes account by re-running `arcctl add account`.

## Requirments

In order to interact with this provider you will need to install the following:

- [Kubectl](https://kubernetes.io/docs/tasks/tools/)

## Authentication

The kubernetes provider takes in a local path to a kubernetes config file and (optionally)
the name of a non-default k8s context to use for the requests. If you provide no values
during account registration, the default config (`~/.kube/config`) and context will be
used for the account.

## Supported resources

- [x] [`service`](../../%40resources/service/)
- [x] [`ingressRule`](../../%40resources/ingressRule/)
- [x] [`deployment`](../../%40resources/deployment/)
- [x] [`namespace`](../../%40resources/namespace/)
- [x] [`helmChart`](../../%40resources/helmChart/)
