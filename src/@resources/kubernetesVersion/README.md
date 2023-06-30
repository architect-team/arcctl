# Kubernetes versions

Kubernetes, also known as K8s, is an open-source system for automating deployment, scaling, and management of containerized applications. It groups containers that make up an application into logical units for easy management and discovery. Kubernetes builds upon 15 years of experience of running production workloads at Google, combined with best-of-breed ideas and practices from the community.

[Go to the Kubernetes website](https://kubernetes.io/)

This resource represents a version of the kubernetes control plane that a specified cloud provider supports. Each cloud provider supports different versions, and using arcctl can help you quickly identify which versions are supported:

```sh
$ arcctl list kubernetesVersion

$ acctl get kubernetesVersion <id>
```
