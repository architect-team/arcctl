# Virtual Private Datacenters (VPDs)

Virtual private datacenters are packages of configuration and rules for how
cloud resources should behave in the environments they host. They allow
operations teams to define "what production means" to them.

## Examples

The example datacenter file below represents a template that stores terraform
state locally and deploys cloud resources to digitalocean. 

The `resources` define individual resources that must exist in each environment
managed by this datacenter. The below example includes:

* A VPC
* A K8s cluster that lives within said VPC
* A kubernetes namespace to host our resources, and
* The nginx ingress controller installed to k8s via helm

Additionally, the template below includes `hook` that instruct application resources
like deployments, services, volumes, and more on how they should behave in the environment.

```yaml
state:
  type: local
  path: /.terraform

resources:
  vpc:
    type: vpc
    name: test-env
    provider: do-personal
    region: nyc1
  cluster:
    type: kubernetesCluster
    provider: do-personal
    name: test-env
    kubernetesVersion: 1.24.12-do.0
    region: nyc1
    vpc: ${{ resources.vpc.id }}
    nodePools:
      - name: pool1
        count: 3
        nodeSize: s-1vcpu-2gb
  namespace:
    type: kubernetesNamespace
    provider: ${{ resources.cluster.provider }}
    name: test-env
  nginx-ingress-controller:
    type: helmChart
    name: ingress-nginx
    provider: ${{ resources.cluster.provider }}
    namespace: ${{ resources.namespace.id }}
    repository: https://kubernetes.github.io/ingress-nginx
    chart: ingress-nginx

hooks:
  - when:
      type: databaseSchema
      databaseType: postgres
    resources:
      db:
        type: database
        provider: do-personal
        name: test-db
        databaseVersion: ${{ this.inputs.databaseVersion }}
        databaseSize: db-s-1vcpu-1gb
        databaseType: ${{ this.inputs.databaseType }}
        vpc: ${{ resources.vpc.id }}
    provider: ${{ this.resources.db.provider }}
    database: ${{ this.resources.db.id }}
  - when:
      type: ingressRule
    loadBalancer: nginx
  - provider: ${{ resources.cluster.provider }}
    namespace: ${{ resources.namespace.id }}
```

## Registering datacenters

The command below won't do anything the first time you apply since no environments
exist yet, but subsequent times will roll out relevant changes to all environments
managed by the datacenter.

```sh
$ cldctl datacenter apply ./datacenter.yml --name my-datacenter
```