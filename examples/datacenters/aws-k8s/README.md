# AWS/Kubernetes datacenter

This datacenter template includes everything you need to run Architect
Components on EKS. It creates a single VPC, EKS cluster, and ALB for the whole
datacenter to be shared across all its environments. All application resources
are then run on the datacenter's EKS cluster with the exception of database
claims which are fulfilled by RDS.

## Variables

- `region` - Region to create resources in
- `domain` - The base domain name or zone that should be used for DNS records

## Datacenter resources

The following resources will be created immediately when your datacenter gets
created. These resources will be shared by all environments this datacenter
powers:

- An AWS VPC where all the resources will reside
- An EKS cluster where all the application workloads will run inside the VPC
  above
- An ALB ingress controller that will connect external traffic to the EKS
  cluster.

## Environment resources

The following resources will be created for each environment you create in this
datacenter:

- A namespace in the EKS cluster named after the environment.
- A DNS zone for the environment that matches `<environment>`.`<domain>` where
  `<environment>` is the environment name and `<domain>` is the domain name
  specified in the datacenter variables.

## Supported application resources

The following application resources are supported by this datacenter:

- `deployment` - Application workloads will be run on the EKS cluster
- `service` - Component services will be registered as kubernetes services on
  the EKS cluster
- `secret` - Variables and dynamic application outputs will be stored as Secrets
  on the EKS cluster
- `ingress` - Component ingresses will be registered as kubernetes ingress
  rules. Each ingress rule will also yield a DNS record pointing to the load
  balancer to ensure the ingress rule is reachable.
- `database` - Component databases will be run via RDS. Each component database
  will get its own database cluster.
