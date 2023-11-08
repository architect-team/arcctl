variable "region" {
  type        = "string"
  description = "Region to deploy resources into"
  default     = "us-east-1"
}

variable "access_key" {
  type        = "string"
  description = "AWS Access Key"
}

variable "secret_key" {
  type        = "string"
  description = "AWS Secret Key"
}

variable "dns_zone" {
  description = "DNS zone ID to use for ingress rules"
  type = "string"
}

module "vpc" {
  build  = "./vpc"
  plugin = "opentofu"
  inputs = {
    access_key = variable.access_key
    secret_key = variable.secret_key
    region  = variable.region
    name    = "${datacenter.name}-datacenter"
  }
}

module "eksCluster" {
  build = "./eks"
  plugin = "opentofu"
  inputs = {
    access_key = variable.access_key
    secret_key = variable.secret_key
    region  = variable.region
    vpc_id   = module.vpc.id
    name    = "${datacenter.name}-cluster"
  }
}


module "loadBalancer" {
  build = "./aws-lb-controller"
  inputs = {
    aws = {
      accessKey = variable.access_key
      secretKey = variable.secret_key
      region = variable.region
    }
    // TODO: Pass account_id as a variable
    accountId = "914808004132"
    name = "${datacenter.name}-lb-controller"
    clusterName = "${datacenter.name}-cluster"
    kubeconfig = module.eksCluster.kubeconfig
  }
}

environment {
  module "namespace" {
    build = "./eks-namespace"
    inputs = {
      name = environment.name
      kubeconfig = module.eksCluster.kubeconfig
    }
  }

  module "postgresCluster" {
    when = contains(environment.nodes.*.type, "database") && contains(environment.nodes.*.inputs.databaseType, "postgres")
    build = "./databaseCluster"
    inputs = {
      access_key = variable.access_key
      secret_key = variable.secret_key
      region = variable.region
      vpc_id = module.vpc.id

      name = "${datacenter.name}-database"
      databaseType = "pg"
      databaseVersion = 15
      databaseSize = "db.t3.medium"
    }
  }

  secret {
    module "secret" {
      build = "./secrets"
      inputs = merge(node.inputs, {
        name = "${node.component}--${node.name}"
        namespace = module.namespace.id
        kubeconfig = module.eksCluster.kubeconfig
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
        host = module.postgresCluster.host
        port = module.postgresCluster.port
        username = module.postgresCluster.username
        password = module.postgresCluster.password
        name = node.inputs.name
      }
    }

    outputs = {
      host = module.postgresCluster.private_host
      port = module.postgresCluster.port
      protocol = "postgresql"
      username = module.postgresCluster.username
      password = module.postgresCluster.password
      url = "postgresql://${module.postgresCluster.username}:${module.postgresCluster.password}@${module.postgresCluster.private_host}:${module.postgresCluster.port}}"
      database = module.database.name
    }
  }

  databaseUser {
    module "databaseUser" {
      build = "./databaseUser"
      inputs = {
        host = module.postgresCluster.host
        port = module.postgresCluster.port
        username = module.postgresCluster.username
        password = module.postgresCluster.password
        database = module.database.database
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

  deployment {
    module "deployment" {
      build = "./eks-deployment"
      inputs = merge(node.inputs, {
        namespace = module.namespace.id
        kubeconfig = module.eksCluster.kubeconfig
      })
    }
  }

  service {
    module "service" {
      build = "./eks-service"
      inputs = merge(node.inputs, {
        name = "${node.component}--${node.name}"
        namespace = module.namespace.id
        kubeconfig = module.eksCluster.kubeconfig
      })
    }

    outputs = {
      protocol = node.inputs.protocol || "http"
      host = module.service.host
      port = module.service.port
      url = "http://${module.service.host}:${module.service.port}"
    }
  }

  ingress {
    module "ingressRule" {
      build = "./ingressRule"
      inputs = merge(node.inputs, {
        name = "${node.component}--${node.name}"
        namespace = module.namespace.id
        kubeconfig = module.eksCluster.kubeconfig
        dns_zone = variable.dns_zone
      })
    }

    module "dnsRecord" {
      build = "./dns-record"
      plugin = "opentofu"
      environment = {
        DIGITALOCEAN_TOKEN = variable.do_token
      }
      inputs = {
        access_key = variable.access_key
        secret_key = variable.secret_key
        region  = variable.region
        dns_zone = variable.dns_zone
        type = "A"
        alb_name = "${node.component}--${node.name}"
        value = module.ingressRule.lb_address
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
}