# Nodes

Nodes represent individual virtual machines. The reason for calling them "nodes" is due to the
most common usage of this resource type: as VMs powering kubernetes clusters. Kubernetes calls
these VMs [nodes](https://kubernetes.io/docs/concepts/architecture/nodes/).

```sh
$ arcctl list node

$ acctl get node <id>

$ arcctl create node

$ arcctl destroy node
```
