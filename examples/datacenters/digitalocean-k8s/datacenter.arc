variable "do_token" {
  description = "The digital ocean API token"
  type = "string"
}

variable "region" {
  description = "The region to create resources in"
  type = "string"
  default = "nyc1"
}

variable "dns_zone" {
  description = "DNS zone to use for ingress rules"
  type = "string"
}

module "vpc" {
  build = "./vpc"
  inputs = {
    region = variable.region
    name = "${datacenter.name}-datacenter"
    "digitalocean:token" = variable.do_token
  }
}

module "k8s" {
  build = "./k8s-cluster"
  inputs = {
    name = "${datacenter.name}-cluster"
    region = variable.region
    vpcId = module.vpc.id
    "digitalocean:token" = variable.do_token
  }
}

environment {
  module "namespace" {
    build = "./k8s-namespace"
    inputs = {
      name = environment.name
      kubeconfig = module.k8s.kubeconfig
    }
  }

  module "postgresCluster" {
    when = contains(environment.nodes.*.type, "database") && contains(environment.nodes.*.inputs.databaseType, "postgres")
    build = "./databaseCluster"
    inputs = {
      name = "${datacenter.name}-database"
      databaseType = "pg"
      databaseVersion = 15
      region = variable.region
      vpcId = module.vpc.id
      "digitalocean:token" = variable.do_token
    }
  }

  module "nginxController" {
    when = contains(environment.nodes.*.type, "ingress")
    build = "./nginx-controller"
    inputs = {
      name = "${datacenter.name}-nginx-controller"
      kubeconfig = module.k8s.kubeconfig
    }
  }

  secret {
    module "secret" {
      build = "./secrets"
      inputs = merge(node.inputs, {
        name = "${node.component}--${node.name}"
        namespace = module.namespace.id
        kubeconfig = module.k8s.kubeconfig
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
        cluster_id = module.postgresCluster.id
        name = node.inputs.name
        "digitalocean:token" = variable.do_token
      }
    }

    outputs = {
      host = module.postgresCluster.private_host
      port = module.postgresCluster.port
      protocol = "postgresql"
      username = module.postgresCluster.username
      password = module.postgresCluster.password
      url = "postgresql://${module.postgresCluster.username}:${module.postgresCluster.password}@${module.postgresCluster.private_host}:${module.postgresCluster.port}}"
      database = module.postgresCluster.database
    }
  }

  databaseUser {
    module "databaseUser" {
      build = "./databaseUser"
      inputs = {
        cluster_id = module.postgresCluster.id
        name = node.inputs.name
        "digitalocean:token" = variable.do_token
      }
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
      build = "./ingressRule"
      inputs = merge(node.inputs, {
        name = "${node.component}--${node.name}"
        namespace = module.namespace.id
        kubeconfig = module.k8s.kubeconfig
        dns_zone = variable.dns_zone
        ingress_class_name = module.nginxController.ingress_class_name
      })
    }

    module "dnsRecord" {
      build = "./dns-record"
      plugin = "opentofu"
      environment = {
        DIGITALOCEAN_TOKEN = variable.do_token
      }
      inputs = {
        domain = variable.dns_zone
        type = "A"
        value = module.ingressRule.load_balancer_ip
        subdomain = node.inputs.subdomain
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
      dns_zone = node.inputs.dns_zone
    }
  }

  deployment {
    module "deployment" {
      build = "./k8s-deployment"
      inputs = merge(node.inputs, {
        namespace = module.namespace.id
        kubeconfig = module.k8s.kubeconfig
      })
    }
  }

  service {
    module "service" {
      build = "./k8s-service"
      inputs = merge(node.inputs, {
        name = "${node.component}--${node.name}"
        namespace = module.namespace.id
        kubeconfig = module.k8s.kubeconfig
      })
    }

    outputs = {
      protocol = node.inputs.protocol || "http"
      host = module.service.host
      port = module.service.port
      url = "http://${module.service.host}:${module.service.port}"
    }
  }
}