# Digitalocean/Kubernetes Datacenter

This datacenter template includes everything you need to run a cloud platform on
top of DOKS (DigitalOcean Kubernetes Service). The datacenter will create a new
VPC and cluster, and will put application resources into their own namespaces
within the cluster. Databases will be fulfilled by DO managed databases and
connected to their corresponding application resources (deployed to k8s)
automatically.

## Variables

- `dotoken` - API token to access your digital ocean account
- `region` - Region to create resources in
- `domain` - The domain to use for ingress rule DNS records

## Datacenter resources

The following resources will be created immediately when your datacenter gets
created. These resources will be shared by all environments this datacenter
powers:

- A DigitalOcean VPC inside the specified region
- A DOKS cluster inside the VPC
- The NGINX ingress controller inside the DOKS cluster

## Environment resources

The following resources will be created for each environment you create in this
datacenter:

- A kubernetes namespace inside the datacenter's k8s cluster. It will have the
  same name as the environment itself.

## Supported application resources

The following application resources are supported by this datacenter:

- `deployment` - Application workloads will be run as kubernetes deployments
- `service` - Service listeners will be registered as kubernetes services
- `secret` - Variables and dynamic application outputs will be stored as
  kubernetes secrets
- `ingress` - Component ingresses will be registered as kubernetes ingress
  rules. Each ingress rule will also yield a DNS record pointing to the load
  balancer to ensure the ingress rule is reachable.
- `database` - Component databases will be fulfilled by DO managed databases.
  Each component database will get its own database cluster.
