variable "gcp_credentials_file" {
  description = "GCP credentials file"
  type = "string"
}

variable "gcp_project" {
  description = "GCP project in which to create resources"
  type = "string"
}

variable "gcp_region" {
description = "GCP region in which to create resources"
  type = "string"
}

variable "dns_zone" {
  description = "DNS zone to use for ingress rules"
  type = "string"
}

module "vpc" {
  build = "./vpc"
  inputs = {
    name = datacenter.name

    "gcp:region" = var.gcp_region
    "gcp:project" = var.gcp_project
    "gcp:credentials" = "file:${var.gcp_credentials_file}"
  }
}

module "kubernetesCluster" {
  build = "./kubernetesCluster"
  inputs = {
    name = datacenter.name

    "gcp:region" = var.gcp_region
    "gcp:project" = var.gcp_project
    "gcp:credentials" = "file:${var.gcp_credentials_file}"

    "kubernetes:nodePools": "[{\"count\":1,\"name\":\"test-pool\",\"nodeSize\":\"e2-small\"}]"
    "kubernetes:vpc" = module.vpc.name
  }
}

environment {
  module "namespace" {
    build = "./kubernetesNamespace"
    inputs = {
      name = environment.name
      kubeconfig = module.kubernetesCluster.kubeconfig
    }
  }

  module "databaseCluster" {
    when = contains(environment.nodes.*.type, "database") && contains(environment.nodes.*.inputs.databaseType, "postgres")
    build = "./databaseCluster"
    inputs = {
      name = "${datacenter.name}-database"
      databaseType = "pg"
      databaseVersion = "POSTGRES_14"
      databasePort = 5432
      region = variable.gcp_region
      vpcId = module.vpc.id

      "gcp:region" = var.gcp_region
      "gcp:project" = var.gcp_project
      "gcp:credentials" = "file:${var.gcp_credentials_file}"
    }
  }

  module "nginxController" {
    when = contains(environment.nodes.*.type, "ingress")
    build = "./helm-chart"
    inputs = {
      kubeconfig = module.kubernetesCluster.kubeconfig
      chart = "ingress-nginx"
      repo = "https://kubernetes.github.io/ingress-nginx"
      namespace = "kube-system"
      values = {
        controller = {
          ingressClass = "nginx"
          publishService = {
            enabled = true
          }
        }
      }
    }
  }

  secret {
    module "secret" {
      build = "./secret"
      inputs = merge(node.inputs, {
        name = "${node.component}--${node.name}"
        namespace = module.namespace.id
        kubeconfig = module.kubernetesCluster.kubeconfig
      })
    }

    outputs = {
      data = module.secret.data
    }
  }

  database {
    when = node.inputs.databaseType == "postgres"

    module "database" {
      build = "./database"
      inputs = {
        cluster_id = module.databaseCluster.id
        name = node.inputs.name
        "gcp:region" = var.gcp_region
        "gcp:project" = var.gcp_project
        "gcp:credentials" = "file:${var.gcp_credentials_file}"
      }
    }

    outputs = {
      host = module.databaseCluster.private_host
      port = module.databaseCluster.port
      protocol = "postgresql"
      username = module.databaseCluster.username
      password = module.databaseCluster.password
      url = "postgresql://${module.databaseCluster.username}:${module.databaseCluster.password}@${module.databaseCluster.host}:${module.databaseCluster.port}/${module.database.name}"
      database = module.database.name
    }
  }

  databaseUser {
    module "databaseUser" {
      build = "./databaseUser"
      inputs = {
        cluster_id = module.databaseCluster.id
        name = node.inputs.name

        "gcp:region" = var.gcp_region
        "gcp:project" = var.gcp_project
        "gcp:credentials" = "file:${var.gcp_credentials_file}"
      }

      # TTL of 1 day
      ttl = 24 * 60 * 60
    }

    outputs = {
      host = node.inputs.host
      port = node.inputs.port
      protocol = node.inputs.protocol
      username = module.databaseUser.username
      password = module.databaseUser.password
      url = "${node.inputs.protocol}://${module.databaseUser.username}:${module.databaseUser.password}@${node.inputs.host}:${node.inputs.port}/${node.inputs.database}"
      database = node.inputs.database
    }
  }

  ingress {
    module "ingressRule" {
      build = "./kubernetesIngress"
      inputs = merge(node.inputs, {
        name = "${node.component}--${node.name}"
        namespace = module.namespace.id
        kubeconfig = module.kubernetesCluster.kubeconfig
        dns_zone = variable.dns_zone
        ingress_class_name = "nginx"
      })
    }

    module "dnsRecord" {
      build = "./dnsRecord"
      inputs = {
        domain = variable.dns_zone
        type = "A"
        value = module.ingressRule.load_balancer_ip
        subdomain = node.inputs.subdomain

        "gcp:region" = var.gcp_region
        "gcp:project" = var.gcp_project
        "gcp:credentials" = "file:${var.gcp_credentials_file}"
      }
    }

    outputs = {
      protocol = module.ingressRule.protocol
      host = module.ingressRule.host
      port = module.ingressRule.port
      username = module.ingressRule.username
      password = module.ingressRule.password
      url = module.ingressRule.url
      path = module.ingressRule.path
      subdomain = node.inputs.subdomain
      dns_zone = variable.dns_zone
    }
  }

  deployment {
    module "deployment" {
      build = "./kubernetesDeployment"
      inputs = merge(node.inputs, {
        namespace = module.namespace.id
        kubeconfig = module.kubernetesCluster.kubeconfig
      })
    }
  }

  service {
    module "service" {
      build = "./kubernetesService"
      inputs = merge(node.inputs, {
        name = "${node.component}--${node.name}"
        namespace = module.namespace.id
        kubeconfig = module.kubernetesCluster.kubeconfig
      })
    }

    outputs = {
      name = module.service.host
      protocol = node.inputs.protocol || "http"
      host = module.service.host
      port = module.service.port
      target_port = module.service.target_port
      url = "${node.inputs.protocol || "http"}://${module.service.host}:${module.service.port}"
    }
  }
}
