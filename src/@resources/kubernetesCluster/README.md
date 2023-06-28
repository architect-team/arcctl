# Kubernetes clusters

Kubernetes, also known as K8s, is an open-source system for automating deployment, scaling, and management of containerized applications. It groups containers that make up an application into logical units for easy management and discovery. Kubernetes builds upon 15 years of experience of running production workloads at Google, combined with best-of-breed ideas and practices from the community.

[Go to the Kubernetes website](https://kubernetes.io/)

This resource represents a kubernetes cluster. You can create and manage kubernetes clusters across a variety of [providers](../../%40providers/) using ArcCtl with ease.

```sh
$ arcctl list kubernetesCluster

$ acctl get kubernetesCluster <id>

$ arcctl create kubernetesCluster

$ arcctl destroy kubernetesCluster
```
