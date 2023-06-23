# v1 datacenter schema

```yaml
# Datacenters can declare variables that the user will be prompted
# to provide when they create or update the datacenter
variables:
  account:
    # Variables can use arcctl resource types
    type: arcctlAccount
    description: The DigitalOcean account used to power the environment
    provider: digitalocean
  region:
    type: region
    description: Region to put resources in
    # Variables can reference each other to simplify prompting
    arcctlAccount: ${{ variables.account }}

# Datacenters can declare resources that should be live/die with
# the lifecycle of the datacenter to be shared with all environments
# it hosts
resources:
  vpc:
    type: vpc
    name: arcctl-datacenter
    account: ${{ variables.doAccount }}
    region: ${{ variables.region }}
  cluster:
    type: kubernetesCluster
    name: arcctl-datacenter
    kubernetesVersion: 1.26.5-do.0
    account: ${{ variables.doAccount }}
    region: ${{ variables.region }}
    vpc: ${{ resources.vpc.id }}
    nodePools:
      - name: pool1
        count: 3
        nodeSize: s-1vcpu-2gb

# New arcctl accounts can be registered that will live/die with
# the lifecycle of the datacenter. These accounts can then be
# used by other resources in the datacenter
accounts:
  cluster:
    name: do-personal-cluster
    provider: kubernetes
    credentials:
      configPath: ${{ resources.cluster.configPath }}

# Datacenters can define rules that only apply to
# individual environments inside the datacenter
environment:
  # Environments can specify dedicated resources that need to
  # exist uniquely in each environment
  resources:
    namespace:
      type: namespace
      # The resources can point to datacenter-level resources
      account: ${{ accounts.cluster.id }}
      # The environment name can be injected dynamically
      name: ${{ environment.name }}
    nginx-ingress-controller:
      type: helmChart
      name: ${{ environment.name }}-ingress-nginx
      account: ${{ accounts.cluster.id }}
      namespace: ${{ environment.resources.namespace.id }}
      repository: https://kubernetes.github.io/ingress-nginx
      chart: ingress-nginx
  
  # Hooks allow operators to define rules for how application
  # resources should behave inside the datacenter
  hooks:
    # Hooks can define "when" clauses that indicate what fields
    # must match for the hook to apply
    - when:
        type: secret
      account: local
    - when:
        type: databaseSchema
        databaseType: postgres
      # Hooks can define inline resources that should be created
      # whenever an application resource matches the hook
      resources:
        db:
          type: database
          account: ${{ variables.doAccount }}
          # Inline resources can reference fields from the application 
          # resource node like .id, .inputs.*, and .outputs.*
          name: ${{ this.id }}
          databaseVersion: ${{ this.inputs.databaseVersion }}
          databaseSize: db-s-1vcpu-1gb
          databaseType: ${{ this.inputs.databaseType }}
          vpc: ${{ resources.vpc.id }}
          region: ${{ variables.region }}
      account: ${{ variables.doAccount }}
      # The matching resource can also refer to the inline resource to populate
      # its configuration
      database: ${{ this.resources.db.id }}
    - when:
        type: ingressRule
      resources:
        dnsRecord:
          type: dnsRecord
          account: ${{ variables.doAccount }}
          dnsZone: ${{ variables.dnsZone }}
          subdomain: ${{ this.inputs.subdomain }}
          recordType: A
          content: ${{ this.outputs.loadBalancerHostname }}
      registry: nginx
      namespace: ${{ environment.resources.namespace.id }}
      dnsZone: ${{ variables.dnsZone }}
    # Application results will be mutated by all matching rules UNTIL
    # an `account` is set.
    - account: ${{ accounts.cluster.id }}
      namespace: ${{ environment.resources.namespace.id }}
```
